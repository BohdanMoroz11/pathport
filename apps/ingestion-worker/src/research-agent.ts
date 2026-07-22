import { type RentProfile, type ResearchTargetPath, rentProfileSchema } from "@pathport/contracts";
import { z } from "zod";

export type AgentUsage = {
  inputTokens: number;
  outputTokens: number;
};

export type AgentResult<T> = {
  value: T;
  usage: AgentUsage;
  modelId: string;
};

export const evidenceCandidateSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1),
  publisher: z.string().min(1).optional(),
  sourceType: z.enum(["official", "legal", "community", "ai_assisted", "other"]),
  trustTier: z.enum(["primary", "secondary", "community", "unknown"]),
  excerpt: z.string().min(1),
});
export type EvidenceCandidate = z.infer<typeof evidenceCandidateSchema>;

export const rentExtractionSchema = z.object({
  rent: rentProfileSchema,
  evidence: z.array(evidenceCandidateSchema).min(1),
  citations: z.object({
    note: z.array(z.number().int().nonnegative()).min(1),
    rows: z.array(z.number().int().nonnegative()).min(1),
  }),
});
export type RentExtraction = z.infer<typeof rentExtractionSchema>;
export const rentDraftSchema = rentExtractionSchema.omit({ evidence: true });
export type RentDraft = z.infer<typeof rentDraftSchema>;

/** Looser model schema: MiniMax sometimes nests citation indexes or mis-nests fields. */
export const rentDraftModelSchema = z
  .object({
    rent: rentProfileSchema,
    citations: z
      .object({
        note: z
          .array(z.union([z.number().int().nonnegative(), z.array(z.number().int().nonnegative())]))
          .optional(),
        rows: z
          .array(z.union([z.number().int().nonnegative(), z.array(z.number().int().nonnegative())]))
          .optional(),
      })
      .optional(),
    // MiniMax sometimes emits citation rows beside rent instead of under citations.
    rows: z
      .array(z.union([z.number().int().nonnegative(), z.array(z.number().int().nonnegative())]))
      .optional(),
  })
  .passthrough();

export function normalizeRentDraft(value: z.infer<typeof rentDraftModelSchema>): RentDraft {
  const citationNote = flattenCitationIndexes(value.citations?.note ?? []);
  const citationRows = flattenCitationIndexes(value.citations?.rows ?? value.rows ?? []);
  return rentDraftSchema.parse({
    rent: value.rent,
    citations: {
      note: citationNote.length > 0 ? citationNote : citationRows,
      rows: citationRows.length > 0 ? citationRows : citationNote,
    },
  });
}

function flattenCitationIndexes(value: Array<number | number[]>): number[] {
  const flat: number[] = [];
  for (const item of value) {
    if (typeof item === "number") flat.push(item);
    else flat.push(...item);
  }
  return [...new Set(flat)];
}

export const judgeOutputSchema = z.object({
  claims: z
    .array(
      z.object({
        fieldPath: z.enum(["content.rent.note", "content.rent.rows"]),
        scoreBasisPoints: z.number().int().min(0).max(10_000),
        explanation: z.string().min(1),
      }),
    )
    .length(2),
});
export type JudgeOutput = z.infer<typeof judgeOutputSchema>;

export interface ResearchAgent {
  discover(input: {
    target: ResearchTargetPath;
    allowedTargets: readonly ResearchTargetPath[];
  }): Promise<AgentResult<{ subtargets: ResearchTargetPath[] }>>;
  searchRentEvidence(input: {
    target: ResearchTargetPath;
  }): Promise<AgentResult<EvidenceCandidate[]>>;
  extractRent(input: {
    target: ResearchTargetPath;
    evidence: EvidenceCandidate[];
    existingRent?: RentProfile;
  }): Promise<AgentResult<RentDraft>>;
  judge(input: RentExtraction): Promise<AgentResult<JudgeOutput>>;
}

export function validateExtractionCitations(extraction: RentExtraction): RentExtraction {
  const max = extraction.evidence.length - 1;
  for (const index of [...extraction.citations.note, ...extraction.citations.rows]) {
    if (index > max) throw new Error(`Citation index ${index} has no corresponding evidence.`);
  }
  return extraction;
}

/** Parse model text that may wrap JSON in fences or leading prose. */
export function parseJsonPayload(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidates = [fenced?.[1]?.trim(), trimmed].filter((value): value is string =>
    Boolean(value),
  );

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      const extracted = extractBalancedJson(candidate);
      if (extracted === undefined) continue;
      try {
        return JSON.parse(extracted);
      } catch {
        // try the next candidate
      }
    }
  }

  throw new Error("Model response did not contain valid JSON.");
}

function extractBalancedJson(text: string): string | undefined {
  const start = text.search(/[[{]/);
  if (start < 0) return undefined;
  const open = text[start];
  const close = open === "[" ? "]" : "}";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === open) depth += 1;
    if (char === close) {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }
  return undefined;
}
