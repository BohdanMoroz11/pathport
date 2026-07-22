import type { ResearchAgentConfig } from "@pathport/config";
import { RENT_RESEARCH_TARGET, type ResearchTargetPath } from "@pathport/contracts";
import { generateObject, type LanguageModel } from "ai";
import { createMinimax } from "vercel-minimax-ai-provider";
import { z } from "zod";
import {
  type AgentResult,
  type AgentUsage,
  type EvidenceCandidate,
  evidenceCandidateSchema,
  type JudgeOutput,
  judgeOutputSchema,
  type RentExtraction,
  type ResearchAgent,
  rentExtractionSchema,
  validateExtractionCitations,
} from "./research-agent.js";

const discoverySchema = z.object({
  subtargets: z.array(z.literal(RENT_RESEARCH_TARGET.path)).length(1),
});
const searchEvidenceSchema = z.array(evidenceCandidateSchema).min(1).max(8);
const generateStructured = generateObject as unknown as (
  options: Record<string, unknown>,
) => Promise<{
  object: unknown;
  usage: { inputTokens?: number; outputTokens?: number };
}>;

export class MiniMaxResearchAgent implements ResearchAgent {
  private readonly model: LanguageModel;

  constructor(
    private readonly apiKey: string,
    private readonly config: ResearchAgentConfig,
    private readonly fetchImplementation: typeof fetch = fetch,
  ) {
    this.model = createMinimax({ apiKey })(config.modelId) as LanguageModel;
  }

  async discover(input: {
    target: ResearchTargetPath;
    allowedTargets: readonly ResearchTargetPath[];
  }): Promise<AgentResult<{ subtargets: ResearchTargetPath[] }>> {
    const result = await generateStructured({
      model: this.model,
      schema: discoverySchema,
      maxOutputTokens: Math.min(this.config.maxOutputTokens, 1_000),
      temperature: 0,
      system:
        "You are Pathport's bounded research planner. Select exactly one target from the supplied allowlist. Never invent or broaden targets.",
      prompt: `Root target: ${input.target}\nAllowed targets: ${input.allowedTargets.join(", ")}`,
    });
    return this.result(discoverySchema.parse(result.object), result.usage);
  }

  async extractRent(input: {
    target: ResearchTargetPath;
    existingRent?: RentExtraction["rent"];
  }): Promise<AgentResult<RentExtraction>> {
    const search = await this.searchEvidence(
      "Current typical monthly asking rents in Germany for one-bedroom apartments in city centre, outside centre, and family-sized apartments. Prefer official German statistics or other primary sources; include representative cities and quote exact supporting excerpts.",
    );
    const result = await generateStructured({
      model: this.model,
      schema: rentExtractionSchema,
      maxOutputTokens: this.config.maxOutputTokens,
      temperature: 0,
      system:
        "You extract reviewable immigration-relocation data. Use only supplied evidence. Preserve units as monthly EUR amounts, do not infer unsupported precision, and cite evidence by zero-based array index.",
      prompt: [
        `Target: ${input.target}`,
        `Existing rent value (context only): ${JSON.stringify(input.existingRent ?? null)}`,
        `Web evidence: ${JSON.stringify(search.value)}`,
        "Produce a concise note and at least one representative city row. Every note and row claim must cite evidence.",
      ].join("\n"),
    });
    const value = validateExtractionCitations(rentExtractionSchema.parse(result.object));
    return {
      value,
      usage: addUsage(search.usage, normalizeUsage(result.usage)),
      modelId: this.config.modelId,
    };
  }

  async judge(input: RentExtraction): Promise<AgentResult<JudgeOutput>> {
    const result = await generateStructured({
      model: this.model,
      schema: judgeOutputSchema,
      maxOutputTokens: Math.min(this.config.maxOutputTokens, 2_000),
      temperature: 0,
      system:
        "You are a strict groundedness judge. Score each claim only against its cited excerpts. Penalize unsupported synthesis, mismatched geography, units, or time period.",
      prompt: JSON.stringify(input),
    });
    const value = judgeOutputSchema.parse(result.object);
    const paths = value.claims.map((claim: JudgeOutput["claims"][number]) => claim.fieldPath);
    if (new Set(paths).size !== 2) {
      throw new Error("Judge must return each expected claim exactly once.");
    }
    return this.result(value, result.usage);
  }

  private async searchEvidence(query: string): Promise<AgentResult<EvidenceCandidate[]>> {
    const response = await this.fetchImplementation(
      "https://api.minimax.io/anthropic/v1/messages",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.config.modelId,
          max_tokens: Math.min(this.config.maxOutputTokens, 4_000),
          temperature: 0,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [
            {
              role: "user",
              content: `${query}\nReturn only a JSON array. Each item must contain url, title, optional publisher, sourceType (official|legal|community|ai_assisted|other), trustTier (primary|secondary|discovery_only|unknown), and a verbatim excerpt.`,
            },
          ],
        }),
        signal: AbortSignal.timeout(60_000),
      },
    );
    if (!response.ok) {
      throw new Error(`MiniMax web search failed (${response.status}): ${await response.text()}`);
    }
    const body = (await response.json()) as {
      content?: Array<{ type?: string; text?: string }>;
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    const text = body.content
      ?.filter((block) => block.type === "text")
      .map((block) => block.text ?? "")
      .join("\n");
    if (!text) throw new Error("MiniMax web search returned no text.");
    const json = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const value = searchEvidenceSchema.parse(JSON.parse(json));
    return {
      value,
      usage: {
        inputTokens: body.usage?.input_tokens ?? 0,
        outputTokens: body.usage?.output_tokens ?? 0,
      },
      modelId: this.config.modelId,
    };
  }

  private result<T>(
    value: T,
    usage: { inputTokens?: number; outputTokens?: number },
  ): AgentResult<T> {
    return { value, usage: normalizeUsage(usage), modelId: this.config.modelId };
  }
}

function normalizeUsage(usage: { inputTokens?: number; outputTokens?: number }): AgentUsage {
  return { inputTokens: usage.inputTokens ?? 0, outputTokens: usage.outputTokens ?? 0 };
}

function addUsage(a: AgentUsage, b: AgentUsage): AgentUsage {
  return {
    inputTokens: a.inputTokens + b.inputTokens,
    outputTokens: a.outputTokens + b.outputTokens,
  };
}
