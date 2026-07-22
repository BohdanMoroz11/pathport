import { createHash } from "node:crypto";
import {
  type DatabaseClient,
  destinationCountries,
  ingestionClaimEvidence,
  ingestionClaims,
  ingestionEvidence,
  ingestionProposals,
  ingestionRuns,
} from "@pathport/db";
import { eq } from "drizzle-orm";

const SOURCE_URL = "https://example.test/germany/rent";

export async function produceFakeRentProposal(
  db: DatabaseClient,
  runId: string,
): Promise<{ proposalId: string | null }> {
  await db
    .update(ingestionRuns)
    .set({ status: "running", startedAt: new Date(), updatedAt: new Date() })
    .where(eq(ingestionRuns.id, runId));

  const [destination] = await db
    .select({ id: destinationCountries.id })
    .from(destinationCountries)
    .where(eq(destinationCountries.code, "DE"))
    .limit(1);
  if (!destination) throw new Error("Fake producer requires the seeded DE destination.");

  const content = {
    note: "Illustrative monthly asking rents in EUR.",
    rows: [
      {
        city: "Berlin",
        centre: 1_500,
        outer: 1_100,
        family: 2_300,
        note: "Deterministic fixture; not current market guidance.",
      },
    ],
  };
  const contentHash = createHash("sha256").update(JSON.stringify(content)).digest("hex");
  const [evidence] = await db
    .insert(ingestionEvidence)
    .values({
      runId,
      url: SOURCE_URL,
      sourceType: "official",
      title: "Fake official rent statistics",
      publisher: "Pathport deterministic fixture",
      retrievedAt: new Date("2026-01-01T00:00:00.000Z"),
      contentHash,
      snapshot: { excerpt: "Deterministic fixture; no network request was made." },
      trustTier: "primary",
    })
    .returning();
  if (!evidence) throw new Error("Evidence insert returned no row.");

  const [proposal] = await db
    .insert(ingestionProposals)
    .values({
      runId,
      targetKind: "content_block",
      operation: "update",
      target: {
        researchPath: "DE.living.rent",
        canonicalTargetPath: "DE.living",
        mergePath: "rent",
        destinationId: destination.id,
      },
      contractVersion: "destination-rent/v1",
      payload: { rent: content },
      dedupKey: `DE.living.rent:${contentHash}`,
    })
    .onConflictDoNothing({ target: ingestionProposals.dedupKey })
    .returning();

  if (!proposal) {
    await completeRun(db, runId);
    return { proposalId: null };
  }

  const claimValues = [
    ["content.rent.note", content.note],
    ["content.rent.rows", content.rows],
  ] as const;
  const claims = await db
    .insert(ingestionClaims)
    .values(
      claimValues.map(([fieldPath, value]) => ({
        proposalId: proposal.id,
        fieldPath,
        value,
        required: true,
        confidence: "high" as const,
        judgeScoreBasisPoints: 10_000,
      })),
    )
    .returning({ id: ingestionClaims.id, fieldPath: ingestionClaims.fieldPath });
  await db
    .insert(ingestionClaimEvidence)
    .values(
      claims
        .filter((claim) => claim.fieldPath.startsWith("content."))
        .map((claim) => ({ claimId: claim.id, evidenceId: evidence.id })),
    );
  await completeRun(db, runId);
  return { proposalId: proposal.id };
}

async function completeRun(db: DatabaseClient, runId: string): Promise<void> {
  await db
    .update(ingestionRuns)
    .set({ status: "completed", finishedAt: new Date(), updatedAt: new Date() })
    .where(eq(ingestionRuns.id, runId));
}
