import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { RENT_RESEARCH_TARGET } from "@pathport/contracts";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  judgeOutputSchema,
  rentExtractionSchema,
  validateExtractionCitations,
} from "./research-agent";

const cassetteSchema = z.object({
  modelId: z.string().min(1),
  discovery: z.object({
    subtargets: z.array(z.literal(RENT_RESEARCH_TARGET.path)).length(1),
  }),
  extraction: rentExtractionSchema,
  judge: judgeOutputSchema,
  usage: z.object({
    inputTokens: z.number().int().nonnegative(),
    outputTokens: z.number().int().nonnegative(),
  }),
});

describe("Ring 2 provider cassette", () => {
  it("replays through current extraction and judge contracts", async () => {
    const raw = await readFile(
      resolve(process.cwd(), "src/fixtures/de-living-rent-v1.json"),
      "utf8",
    );
    const cassette = cassetteSchema.parse(JSON.parse(raw));
    expect(validateExtractionCitations(cassette.extraction).rent.rows).toHaveLength(1);
    expect(new Set(cassette.judge.claims.map((claim) => claim.fieldPath))).toEqual(
      new Set(["content.rent.note", "content.rent.rows"]),
    );
  });
});
