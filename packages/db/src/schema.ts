import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { RouteDetails } from "./route-details.js";

// --- Enums -----------------------------------------------------------------

export const reviewStatusEnum = pgEnum("review_status", [
  "draft",
  "needs_review",
  "reviewed",
  "outdated",
]);

export const routeTypeEnum = pgEnum("route_type", [
  "work",
  "study",
  "family",
  "freelance",
  "digital_nomad",
  "business",
  "humanitarian",
  "long_stay",
  "other",
]);

export const sourceTypeEnum = pgEnum("source_type", [
  "official",
  "legal",
  "community",
  "ai_assisted",
  "other",
]);

export const confidenceEnum = pgEnum("confidence", ["low", "medium", "high"]);

export const contentScopeEnum = pgEnum("content_scope", [
  "destination",
  "citizenship_destination",
  "route",
  "route_citizenship",
  "assumption",
]);

export const citationTargetEnum = pgEnum("citation_target", [
  "destination_content_block",
  "route",
  "route_applicability",
]);

export const workPermissionEnum = pgEnum("work_permission", ["none", "limited", "full"]);

export const pathToPrEnum = pgEnum("path_to_pr", ["none", "eventual", "direct"]);

export const ingestionRunTypeEnum = pgEnum("ingestion_run_type", [
  "discovery",
  "extraction",
  "refresh",
  "fake",
]);
export const ingestionRunStatusEnum = pgEnum("ingestion_run_status", [
  "queued",
  "running",
  "completed",
  "failed",
  "budget_exceeded",
]);
export const ingestionTriggerEnum = pgEnum("ingestion_trigger", ["manual", "scheduled"]);
export const ingestionTargetKindEnum = pgEnum("ingestion_target_kind", [
  "content_block",
  "route",
  "route_applicability",
  "source_document",
  "citation",
]);
export const ingestionOperationEnum = pgEnum("ingestion_operation", ["create", "update"]);
export const ingestionProposalStatusEnum = pgEnum("ingestion_proposal_status", [
  "pending",
  "approved",
  "rejected",
  "partially_applied",
  "blocked",
  "applied",
  "superseded",
]);
export const ingestionClaimDecisionEnum = pgEnum("ingestion_claim_decision", [
  "pending",
  "approved",
  "rejected",
  "held",
  "edited",
]);
export const reviewerKindEnum = pgEnum("reviewer_kind", ["human", "ai"]);
export const evidenceTrustTierEnum = pgEnum("evidence_trust_tier", [
  "primary",
  "secondary",
  "community",
  "unknown",
]);

// --- Shared column groups --------------------------------------------------

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

/**
 * Content-quality signals shared by tables that hold migration content.
 * The user-facing quality label is derived from these in the UI, never stored.
 * See docs/domain-model.md.
 */
const contentMetadata = {
  reviewStatus: reviewStatusEnum("review_status").notNull().default("draft"),
  confidence: confidenceEnum("confidence").notNull().default("low"),
  isDemo: boolean("is_demo").notNull().default(false),
};

// The flexible route-detail shape and its runtime validation live in
// ./route-details.ts (re-exported above). Kept as validated JSONB rather than
// block tables while the shape is still volatile; see docs/domain-model.md.

// --- Tables ----------------------------------------------------------------

export const citizenships = pgTable("citizenships", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 3 }).notNull().unique(),
  name: text("name").notNull(),
  // Flag emoji placeholder shown in the destination shell; see docs/domain-model.md.
  flag: text("flag"),
  ...timestamps,
});

export const destinationCountries = pgTable("destination_countries", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 2 }).notNull().unique(),
  name: text("name").notNull(),

  // Destination identity shown across the shell (rail + Overview).
  flag: text("flag"),
  tagline: text("tagline"),
  region: text("region"),
  description: text("description"),

  ...contentMetadata,
  ...timestamps,
});

/**
 * Smallest canonical page content unit. A destination page is assembled from
 * these scoped blocks instead of one coarse destination blob plus an
 * arrival-context blob. Blocks can be destination-wide, citizenship-specific,
 * route-specific, route × citizenship-specific, or explicit assumption/persona
 * examples (see docs/domain-model.md).
 */
export const destinationContentBlocks = pgTable(
  "destination_content_blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    destinationCountryId: uuid("destination_country_id")
      .notNull()
      .references(() => destinationCountries.id, { onDelete: "cascade" }),
    sectionKey: text("section_key").notNull(),
    blockKey: text("block_key").notNull(),
    scope: contentScopeEnum("scope").notNull(),
    citizenshipId: uuid("citizenship_id").references(() => citizenships.id, {
      onDelete: "cascade",
    }),
    routeId: uuid("route_id"),
    assumptions: jsonb("assumptions").$type<Record<string, unknown>>().notNull().default({}),
    content: jsonb("content").$type<unknown>().notNull().default({}),
    targetPath: text("target_path").notNull(),
    sourceRunId: uuid("source_run_id"),
    sourceProposalId: uuid("source_proposal_id"),
    ...contentMetadata,
    ...timestamps,
  },
  (table) => [
    index("destination_content_blocks_destination_idx").on(table.destinationCountryId),
    index("destination_content_blocks_citizenship_idx").on(table.citizenshipId),
    index("destination_content_blocks_route_idx").on(table.routeId),
    index("destination_content_blocks_scope_idx").on(table.scope),
    uniqueIndex("destination_content_blocks_target_idx").on(table.targetPath),
  ],
);

export const routes = pgTable(
  "routes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    destinationCountryId: uuid("destination_country_id")
      .notNull()
      .references(() => destinationCountries.id, { onDelete: "cascade" }),
    type: routeTypeEnum("type").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),

    // Comparison fields ("comparable at a glance"). Cost/timeline are optional
    // ranges; the rest describe the route's standing.
    costMin: integer("cost_min"),
    costMax: integer("cost_max"),
    costCurrency: varchar("cost_currency", { length: 3 }),
    timelineMinMonths: integer("timeline_min_months"),
    timelineMaxMonths: integer("timeline_max_months"),
    workPermission: workPermissionEnum("work_permission").notNull(),
    familyInclusion: boolean("family_inclusion").notNull().default(false),
    familyInclusionNote: text("family_inclusion_note"),
    pathToPermanentResidence: pathToPrEnum("path_to_permanent_residence").notNull(),
    pathToPermanentResidenceNote: text("path_to_permanent_residence_note"),
    renewable: boolean("renewable").notNull().default(false),
    renewableNote: text("renewable_note"),

    // Flexible detail fields.
    details: jsonb("details").$type<RouteDetails>().notNull().default({}),
    sourceRunId: uuid("source_run_id"),
    sourceProposalId: uuid("source_proposal_id"),

    ...contentMetadata,
    ...timestamps,
  },
  (table) => [
    index("routes_destination_country_id_idx").on(table.destinationCountryId),
    index("routes_type_idx").on(table.type),
  ],
);

/**
 * route <-> citizenship applicability join. A route is shown for a citizenship
 * when a row links them; this is the join the citizenship-first UI filters on.
 */
export const routeApplicability = pgTable(
  "route_applicability",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    routeId: uuid("route_id")
      .notNull()
      .references(() => routes.id, { onDelete: "cascade" }),
    citizenshipId: uuid("citizenship_id")
      .notNull()
      .references(() => citizenships.id, { onDelete: "cascade" }),
    note: text("note"),
    sourceRunId: uuid("source_run_id"),
    sourceProposalId: uuid("source_proposal_id"),
    ...contentMetadata,
    ...timestamps,
  },
  (table) => [
    uniqueIndex("route_applicability_route_citizenship_idx").on(table.routeId, table.citizenshipId),
    index("route_applicability_citizenship_id_idx").on(table.citizenshipId),
  ],
);

export const sourceDocuments = pgTable(
  "source_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: sourceTypeEnum("type").notNull(),
    label: text("label").notNull(),
    url: text("url").notNull(),
    publisher: text("publisher"),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull().default({}),
    sourceRunId: uuid("source_run_id"),
    sourceProposalId: uuid("source_proposal_id"),
    ...timestamps,
  },
  (table) => [uniqueIndex("source_documents_url_idx").on(table.url)],
);

export const contentCitations = pgTable(
  "content_citations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceDocumentId: uuid("source_document_id")
      .notNull()
      .references(() => sourceDocuments.id, { onDelete: "cascade" }),
    targetType: citationTargetEnum("target_type").notNull(),
    targetId: uuid("target_id").notNull(),
    fieldPath: text("field_path"),
    note: text("note"),
    ...timestamps,
  },
  (table) => [
    index("content_citations_source_document_idx").on(table.sourceDocumentId),
    index("content_citations_target_idx").on(table.targetType, table.targetId),
  ],
);

// --- Ingestion proposal layer ---------------------------------------------

export const ingestionRuns = pgTable(
  "ingestion_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentRunId: uuid("parent_run_id").references((): AnyPgColumn => ingestionRuns.id, {
      onDelete: "cascade",
    }),
    type: ingestionRunTypeEnum("type").notNull(),
    target: jsonb("target").$type<Record<string, unknown>>().notNull(),
    status: ingestionRunStatusEnum("status").notNull().default("queued"),
    trigger: ingestionTriggerEnum("trigger").notNull().default("manual"),
    modelId: text("model_id"),
    promptVersion: text("prompt_version").notNull(),
    guardrailVersion: text("guardrail_version").notNull(),
    agentVersion: text("agent_version").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    tokensIn: integer("tokens_in").notNull().default(0),
    tokensOut: integer("tokens_out").notNull().default(0),
    callCount: integer("call_count").notNull().default(0),
    costEstimateMicros: integer("cost_estimate_micros").notNull().default(0),
    modelPricing: jsonb("model_pricing").$type<Record<string, unknown>>().notNull().default({}),
    tokenBudget: integer("token_budget"),
    costCeilingMicros: integer("cost_ceiling_micros"),
    childTokensIn: integer("child_tokens_in").notNull().default(0),
    childTokensOut: integer("child_tokens_out").notNull().default(0),
    childCostEstimateMicros: integer("child_cost_estimate_micros").notNull().default(0),
    error: text("error"),
    rawTraceRef: text("raw_trace_ref"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("ingestion_runs_parent_idx").on(table.parentRunId),
    index("ingestion_runs_status_idx").on(table.status),
    uniqueIndex("ingestion_runs_idempotency_idx").on(table.idempotencyKey),
  ],
);

export const ingestionProposals = pgTable(
  "ingestion_proposals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    runId: uuid("run_id")
      .notNull()
      .references(() => ingestionRuns.id, { onDelete: "cascade" }),
    targetKind: ingestionTargetKindEnum("target_kind").notNull(),
    operation: ingestionOperationEnum("operation").notNull(),
    targetRef: uuid("target_ref"),
    target: jsonb("target").$type<Record<string, unknown>>().notNull(),
    contractVersion: text("contract_version").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    dedupKey: text("dedup_key").notNull(),
    status: ingestionProposalStatusEnum("status").notNull().default("pending"),
    supersedesId: uuid("supersedes_id").references((): AnyPgColumn => ingestionProposals.id, {
      onDelete: "set null",
    }),
    decisionSummary: jsonb("decision_summary")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    appliedRecordRef: uuid("applied_record_ref"),
    appliedAt: timestamp("applied_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("ingestion_proposals_run_idx").on(table.runId),
    index("ingestion_proposals_status_idx").on(table.status),
    uniqueIndex("ingestion_proposals_dedup_idx").on(table.dedupKey),
  ],
);

export const ingestionClaims = pgTable(
  "ingestion_claims",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    proposalId: uuid("proposal_id")
      .notNull()
      .references(() => ingestionProposals.id, { onDelete: "cascade" }),
    fieldPath: text("field_path").notNull(),
    value: jsonb("value").$type<unknown>().notNull(),
    required: boolean("required").notNull().default(false),
    confidence: confidenceEnum("confidence").notNull(),
    judgeScoreBasisPoints: integer("judge_score_basis_points"),
    note: text("note"),
    decision: ingestionClaimDecisionEnum("decision").notNull().default("pending"),
    editedValue: jsonb("edited_value").$type<unknown>(),
    reviewedBy: text("reviewed_by"),
    reviewerKind: reviewerKindEnum("reviewer_kind"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    decisionNote: text("decision_note"),
    ...timestamps,
  },
  (table) => [
    index("ingestion_claims_proposal_idx").on(table.proposalId),
    uniqueIndex("ingestion_claims_proposal_field_idx").on(table.proposalId, table.fieldPath),
  ],
);

export const ingestionEvidence = pgTable(
  "ingestion_evidence",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    runId: uuid("run_id")
      .notNull()
      .references(() => ingestionRuns.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    sourceType: sourceTypeEnum("source_type").notNull(),
    title: text("title").notNull(),
    publisher: text("publisher"),
    retrievedAt: timestamp("retrieved_at", { withTimezone: true }).notNull(),
    contentHash: text("content_hash").notNull(),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull().default({}),
    trustTier: evidenceTrustTierEnum("trust_tier").notNull().default("unknown"),
    ...timestamps,
  },
  (table) => [
    index("ingestion_evidence_run_idx").on(table.runId),
    uniqueIndex("ingestion_evidence_run_hash_idx").on(table.runId, table.contentHash),
  ],
);

export const ingestionClaimEvidence = pgTable(
  "ingestion_claim_evidence",
  {
    claimId: uuid("claim_id")
      .notNull()
      .references(() => ingestionClaims.id, { onDelete: "cascade" }),
    evidenceId: uuid("evidence_id")
      .notNull()
      .references(() => ingestionEvidence.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.claimId, table.evidenceId] }),
    index("ingestion_claim_evidence_evidence_idx").on(table.evidenceId),
  ],
);
