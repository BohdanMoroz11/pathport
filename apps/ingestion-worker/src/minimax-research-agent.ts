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
  parseJsonPayload,
  type RentDraft,
  type RentExtraction,
  type ResearchAgent,
  rentDraftSchema,
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

type MiniMaxContentBlock = {
  type?: string;
  text?: string;
  content?: unknown;
};

type WebSearchHit = {
  url: string;
  title: string;
  excerpt: string;
};

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

  async searchRentEvidence(input: {
    target: ResearchTargetPath;
  }): Promise<AgentResult<EvidenceCandidate[]>> {
    return this.searchEvidence(
      `Target ${input.target}. Current typical monthly asking rents in Germany for one-bedroom apartments in city centre, outside centre, and family-sized apartments. Prefer official German statistics or other primary sources; include representative cities and quote exact supporting excerpts.`,
    );
  }

  async extractRent(input: {
    target: ResearchTargetPath;
    evidence: EvidenceCandidate[];
    existingRent?: RentDraft["rent"];
  }): Promise<AgentResult<RentDraft>> {
    const result = await generateStructured({
      model: this.model,
      schema: rentDraftSchema,
      maxOutputTokens: this.config.maxOutputTokens,
      temperature: 0,
      system:
        "You extract reviewable immigration-relocation data. Use only supplied evidence. Preserve units as monthly EUR amounts, do not infer unsupported precision, and cite evidence by zero-based array index.",
      prompt: [
        `Target: ${input.target}`,
        `Existing rent value (context only): ${JSON.stringify(input.existingRent ?? null)}`,
        `Web evidence: ${JSON.stringify(input.evidence)}`,
        "Produce a concise note and at least one representative city row. Every note and row claim must cite evidence.",
      ].join("\n"),
    });
    return this.result(rentDraftSchema.parse(result.object), result.usage);
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
              content: [
                query,
                "Use web search to gather sources, then reply with ONLY a JSON array of at most 8 items (no narration).",
                "Each item must contain url, title, optional publisher,",
                "sourceType (official|legal|community|ai_assisted|other),",
                "trustTier (primary|secondary|community|unknown), and a verbatim excerpt.",
              ].join(" "),
            },
          ],
        }),
        signal: AbortSignal.timeout(90_000),
      },
    );
    if (!response.ok) {
      throw new Error(`MiniMax web search failed (${response.status}): ${await response.text()}`);
    }
    const body = (await response.json()) as {
      content?: MiniMaxContentBlock[];
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    const searchUsage = {
      inputTokens: body.usage?.input_tokens ?? 0,
      outputTokens: body.usage?.output_tokens ?? 0,
    };
    const text = (body.content ?? [])
      .filter((block) => block.type === "text")
      .map((block) => block.text ?? "")
      .join("\n")
      .trim();
    const hits = extractWebSearchHits(body.content ?? []);

    if (text) {
      try {
        const parsed = truncateEvidenceArray(normalizeEvidenceCandidates(parseJsonPayload(text)));
        return {
          value: searchEvidenceSchema.parse(parsed),
          usage: searchUsage,
          modelId: this.config.modelId,
        };
      } catch (error) {
        if (hits.length === 0) throw error;
        // Fall through to search-hit synthesis when MiniMax narrates or truncates.
      }
    }

    if (hits.length === 0) {
      throw new Error("MiniMax web search returned neither JSON evidence nor search hits.");
    }

    return {
      value: searchEvidenceSchema.parse(evidenceFromSearchHits(hits)),
      usage: searchUsage,
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

export function extractWebSearchHits(content: MiniMaxContentBlock[]): WebSearchHit[] {
  const hits: WebSearchHit[] = [];
  for (const block of content) {
    if (block.type !== "web_search_tool_result") continue;
    const items = normalizeToolResultContent(block.content);
    for (const item of items) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const record = item as Record<string, unknown>;
      if (record.type !== "web_search_result") continue;
      const url = typeof record.url === "string" ? record.url : "";
      const title = typeof record.title === "string" ? record.title : "";
      const excerpt = typeof record.content === "string" ? record.content.trim() : "";
      if (!url || !title || !excerpt) continue;
      hits.push({ url, title, excerpt: excerpt.slice(0, 600) });
    }
  }
  return hits;
}

export function evidenceFromSearchHits(hits: WebSearchHit[]): EvidenceCandidate[] {
  return hits.slice(0, 8).map((hit) => {
    const host = safeHostname(hit.url);
    return {
      url: hit.url,
      title: hit.title,
      excerpt: hit.excerpt,
      ...(host ? { publisher: host } : {}),
      sourceType: classifySourceType(host),
      trustTier: classifyTrustTier(host),
    };
  });
}

function safeHostname(url: string): string | undefined {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

function classifySourceType(host: string | undefined): EvidenceCandidate["sourceType"] {
  if (!host) return "other";
  if (isOfficialHost(host)) return "official";
  if (/(reddit|facebook|instagram|twitter|x\.com|quora)/i.test(host)) return "community";
  return "other";
}

function classifyTrustTier(host: string | undefined): EvidenceCandidate["trustTier"] {
  if (!host) return "unknown";
  if (isOfficialHost(host)) return "primary";
  if (/(reddit|facebook|instagram|twitter|x\.com|quora)/i.test(host)) return "community";
  return "secondary";
}

function isOfficialHost(host: string): boolean {
  return /(\.gov|\.gov\.[a-z]{2}|destatis\.de|bund\.de|europa\.eu|bbsr\.bund\.de|statistik\.)/i.test(
    host,
  );
}

export function truncateEvidenceArray(value: unknown): unknown {
  return Array.isArray(value) ? value.slice(0, 8) : value;
}

export function normalizeEvidenceCandidates(value: unknown): unknown {
  if (!Array.isArray(value)) return value;
  return value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return item;
    const record = item as Record<string, unknown>;
    const excerpt =
      firstString(record.excerpt) ??
      firstString(record["verbatim excerpt"]) ??
      firstString(record.content) ??
      firstString(record.snippet) ??
      firstString(record.quote);
    return {
      ...record,
      ...(excerpt ? { excerpt } : {}),
    };
  });
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim() !== "") return value.trim();
  }
  return undefined;
}

function normalizeToolResultContent(content: unknown): unknown[] {
  if (Array.isArray(content)) return content;
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeUsage(usage: { inputTokens?: number; outputTokens?: number }): AgentUsage {
  return { inputTokens: usage.inputTokens ?? 0, outputTokens: usage.outputTokens ?? 0 };
}
