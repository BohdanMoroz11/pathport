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
