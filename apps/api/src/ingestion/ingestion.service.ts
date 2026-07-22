import { randomUUID } from "node:crypto";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  type OnModuleDestroy,
} from "@nestjs/common";
import { getRedisUrl, getResearchAgentConfig } from "@pathport/config";
import {
  DISCOVERY_RESEARCH_JOB,
  FAKE_RESEARCH_JOB,
  INGESTION_QUEUE,
  RENT_RESEARCH_TARGET,
} from "@pathport/contracts";
import {
  contentCitations,
  ingestionClaimEvidence,
  ingestionClaims,
  ingestionEvidence,
  ingestionProposals,
  ingestionRuns,
  sourceDocuments,
} from "@pathport/db";
import { Queue } from "bullmq";
import { and, eq, inArray } from "drizzle-orm";
import { DatabaseService } from "../database/database.service";
import { WriteService } from "../write/write.service";
import {
  parseCitationBody,
  parseContentBlockBody,
  parseRouteApplicabilityBody,
  parseRouteBody,
  parseSourceDocumentBody,
} from "../write/write.validation";
import { assembleReviewedClaims } from "./publish-mapper";

export type ReviewClaimInput = {
  decision: "approved" | "rejected" | "held" | "edited";
  editedValue?: unknown;
  note?: string;
  reviewer: string;
};

type Proposal = typeof ingestionProposals.$inferSelect;

@Injectable()
export class IngestionService implements OnModuleDestroy {
  private readonly queue: Queue;

  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
    @Inject(WriteService) private readonly writes: WriteService,
  ) {
    const url = new URL(getRedisUrl());
    this.queue = new Queue(INGESTION_QUEUE, {
      connection: {
        host: url.hostname,
        port: Number(url.port || 6379),
        username: url.username || undefined,
        password: url.password || undefined,
        lazyConnect: true,
        ...(url.protocol === "rediss:" ? { tls: {} } : {}),
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.queue.close();
  }

  async triggerFakeResearch(): Promise<{ runId: string; jobId: string | undefined }> {
    const runId = randomUUID();
    await this.database.client.insert(ingestionRuns).values({
      id: runId,
      type: "fake",
      target: { path: "DE.living.rent" },
      promptVersion: "fake-v1",
      guardrailVersion: "fake-v1",
      agentVersion: "fake-v1",
      idempotencyKey: `fake:${runId}`,
      tokenBudget: 0,
      costCeilingMicros: 0,
    });
    try {
      const job = await this.queue.add(FAKE_RESEARCH_JOB, { runId }, { jobId: runId });
      return { runId, jobId: job.id };
    } catch (error) {
      await this.database.client
        .update(ingestionRuns)
        .set({
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
          finishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(ingestionRuns.id, runId));
      throw error;
    }
  }

  async triggerResearch(): Promise<{ runId: string; jobId: string | undefined }> {
    const runId = randomUUID();
    const config = getResearchAgentConfig();
    await this.database.client.insert(ingestionRuns).values({
      id: runId,
      type: "discovery",
      target: { path: RENT_RESEARCH_TARGET.path },
      modelId: config.modelId,
      promptVersion: config.promptVersion,
      guardrailVersion: config.guardrailVersion,
      agentVersion: config.agentVersion,
      idempotencyKey: `discovery:${runId}:${RENT_RESEARCH_TARGET.path}`,
      tokenBudget: config.cascadeTokenBudget,
      costCeilingMicros: config.cascadeCostCeilingMicros,
      modelPricing: config.pricing,
    });
    try {
      const job = await this.queue.add(
        DISCOVERY_RESEARCH_JOB,
        { version: 1, runId },
        { jobId: runId },
      );
      return { runId, jobId: job.id };
    } catch (error) {
      await this.database.client
        .update(ingestionRuns)
        .set({
          status: "failed",
          error: error instanceof Error ? error.message : String(error),
          finishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(ingestionRuns.id, runId));
      throw error;
    }
  }

  async reviewClaim(claimId: string, input: ReviewClaimInput) {
    if (input.decision === "edited" && input.editedValue === undefined) {
      throw new BadRequestException("editedValue is required for an edited claim.");
    }
    const [existing] = await this.database.client
      .select({ proposalId: ingestionClaims.proposalId, proposalStatus: ingestionProposals.status })
      .from(ingestionClaims)
      .innerJoin(ingestionProposals, eq(ingestionProposals.id, ingestionClaims.proposalId))
      .where(eq(ingestionClaims.id, claimId))
      .limit(1);
    if (!existing) throw new NotFoundException(`Unknown ingestion claim "${claimId}".`);
    if (["applied", "partially_applied", "superseded"].includes(existing.proposalStatus)) {
      throw new BadRequestException(
        `Cannot review a claim on an ${existing.proposalStatus} proposal.`,
      );
    }
    const [claim] = await this.database.client
      .update(ingestionClaims)
      .set({
        decision: input.decision,
        editedValue: input.decision === "edited" ? input.editedValue : null,
        reviewedBy: input.reviewer,
        reviewerKind: "human",
        reviewedAt: new Date(),
        decisionNote: input.note ?? null,
        updatedAt: new Date(),
      })
      .where(eq(ingestionClaims.id, claimId))
      .returning();
    if (!claim) throw new NotFoundException(`Unknown ingestion claim "${claimId}".`);
    const decisions = await this.database.client
      .select({ decision: ingestionClaims.decision })
      .from(ingestionClaims)
      .where(eq(ingestionClaims.proposalId, existing.proposalId));
    if (decisions.every((row) => row.decision !== "pending")) {
      const status = decisions.every((row) => row.decision === "rejected")
        ? "rejected"
        : "approved";
      await this.database.client
        .update(ingestionProposals)
        .set({ status, updatedAt: new Date() })
        .where(eq(ingestionProposals.id, existing.proposalId));
    }
    return claim;
  }

  async publishProposal(proposalId: string) {
    const [proposal] = await this.database.client
      .select()
      .from(ingestionProposals)
      .where(eq(ingestionProposals.id, proposalId))
      .limit(1);
    if (!proposal) throw new NotFoundException(`Unknown ingestion proposal "${proposalId}".`);
    if (["applied", "partially_applied", "superseded"].includes(proposal.status)) {
      throw new BadRequestException(`Proposal is already ${proposal.status}.`);
    }

    const claims = await this.database.client
      .select()
      .from(ingestionClaims)
      .where(eq(ingestionClaims.proposalId, proposalId));
    const assembly = assembleReviewedClaims(claims);
    if (assembly.status === "blocked") {
      await this.database.client
        .update(ingestionProposals)
        .set({
          status: "blocked",
          decisionSummary: { missingRequiredFields: assembly.missingRequiredFields },
          updatedAt: new Date(),
        })
        .where(eq(ingestionProposals.id, proposalId));
      return assembly;
    }
    if (assembly.publishedFields.length === 0) {
      throw new BadRequestException("Proposal has no approved or edited claims to publish.");
    }

    const provenance = { runId: proposal.runId, proposalId: proposal.id };
    const canonicalConfidence = lowestConfidence(
      claims
        .filter((claim) => claim.decision === "approved" || claim.decision === "edited")
        .map((claim) => claim.confidence),
    );
    const record = await this.applyCanonical(
      proposal,
      assembly.payload,
      provenance,
      canonicalConfidence,
    );
    await this.mapEvidenceToCitations(proposal.id, record.id, proposal.targetKind);
    await this.database.client
      .update(ingestionProposals)
      .set({
        status: assembly.status,
        decisionSummary: { publishedFields: assembly.publishedFields },
        appliedRecordRef: record.id,
        appliedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(ingestionProposals.id, proposal.id));
    if (proposal.supersedesId) {
      await this.database.client
        .update(ingestionProposals)
        .set({ status: "superseded", updatedAt: new Date() })
        .where(eq(ingestionProposals.id, proposal.supersedesId));
    }
    return { ...assembly, recordId: record.id };
  }

  private async applyCanonical(
    proposal: Proposal,
    payload: Record<string, unknown>,
    provenance: { runId: string; proposalId: string },
    confidence: "low" | "medium" | "high",
  ): Promise<{ id: string }> {
    if (proposal.targetKind === "content_block") {
      if (
        proposal.target.researchPath === RENT_RESEARCH_TARGET.path &&
        proposal.target.canonicalTargetPath === RENT_RESEARCH_TARGET.canonicalTargetPath &&
        proposal.target.mergePath === RENT_RESEARCH_TARGET.mergePath
      ) {
        const content =
          typeof payload.content === "object" && payload.content !== null
            ? (payload.content as Record<string, unknown>)
            : {};
        return this.writes.patchDestinationRent(content.rent, confidence, provenance);
      }
      return this.requireRow(
        await this.writes.upsertContentBlock(parseContentBlockBody(payload), provenance),
      );
    }
    if (proposal.targetKind === "route") {
      if (proposal.operation === "update" && !proposal.targetRef) {
        throw new BadRequestException("Route update needs targetRef.");
      }
      return this.writes.createRoute(
        parseRouteBody(payload),
        provenance,
        proposal.targetRef ?? undefined,
      );
    }
    if (proposal.targetKind === "route_applicability") {
      return this.requireRow(
        await this.writes.upsertRouteApplicability(
          parseRouteApplicabilityBody(payload),
          provenance,
        ),
      );
    }
    if (proposal.targetKind === "source_document") {
      return this.requireRow(
        await this.writes.upsertSourceDocument(parseSourceDocumentBody(payload), provenance),
      );
    }
    return this.requireRow(await this.writes.createCitation(parseCitationBody(payload)));
  }

  private requireRow<T extends { id: string }>(row: T | undefined): T {
    if (!row) throw new BadRequestException("Canonical write did not return a row.");
    return row;
  }

  private async mapEvidenceToCitations(
    proposalId: string,
    targetId: string,
    kind: Proposal["targetKind"],
  ): Promise<void> {
    const targetType =
      kind === "content_block"
        ? "destination_content_block"
        : kind === "route"
          ? "route"
          : kind === "route_applicability"
            ? "route_applicability"
            : null;
    if (!targetType) return;
    const claimRows = await this.database.client
      .select({ id: ingestionClaims.id, fieldPath: ingestionClaims.fieldPath })
      .from(ingestionClaims)
      .where(
        and(
          eq(ingestionClaims.proposalId, proposalId),
          inArray(ingestionClaims.decision, ["approved", "edited"]),
        ),
      );
    for (const claim of claimRows) {
      const evidenceRows = await this.database.client
        .select({ evidence: ingestionEvidence })
        .from(ingestionClaimEvidence)
        .innerJoin(ingestionEvidence, eq(ingestionEvidence.id, ingestionClaimEvidence.evidenceId))
        .where(eq(ingestionClaimEvidence.claimId, claim.id));
      for (const { evidence } of evidenceRows) {
        const [source] = await this.database.client
          .insert(sourceDocuments)
          .values({
            type: evidence.sourceType,
            label: evidence.title,
            url: evidence.url,
            publisher: evidence.publisher,
            lastReviewedAt: evidence.retrievedAt,
            snapshot: evidence.snapshot,
            sourceRunId: evidence.runId,
            sourceProposalId: proposalId,
          })
          .onConflictDoUpdate({
            target: sourceDocuments.url,
            set: {
              snapshot: evidence.snapshot,
              lastReviewedAt: evidence.retrievedAt,
              updatedAt: new Date(),
            },
          })
          .returning();
        if (source) {
          await this.database.client.insert(contentCitations).values({
            sourceDocumentId: source.id,
            targetType,
            targetId,
            fieldPath: claim.fieldPath,
          });
        }
      }
    }
  }
}

function lowestConfidence(values: Array<"low" | "medium" | "high">): "low" | "medium" | "high" {
  if (values.includes("low")) return "low";
  if (values.includes("medium")) return "medium";
  return "high";
}
