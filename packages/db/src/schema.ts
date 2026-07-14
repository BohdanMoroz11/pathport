import type { DestinationDetail, DestinationPairing } from "@pathport/contracts";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
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

  // Destination-level section content (Country / Living / Work / Family +
  // quick facts) as validated JSONB — the shape and its runtime validation live
  // in @pathport/contracts. Kept as JSONB while the section shapes are volatile;
  // see docs/domain-model.md.
  profile: jsonb("profile").$type<DestinationDetail>().notNull().default({}),

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

/**
 * Visa-free / visitor / initial-arrival context for a citizenship x destination
 * pair. This is a fact about the pair, not a migration route.
 */
export const arrivalContext = pgTable(
  "arrival_context",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    citizenshipId: uuid("citizenship_id")
      .notNull()
      .references(() => citizenships.id, { onDelete: "cascade" }),
    destinationCountryId: uuid("destination_country_id")
      .notNull()
      .references(() => destinationCountries.id, { onDelete: "cascade" }),
    visaFreeDays: integer("visa_free_days"),
    summary: text("summary").notNull(),

    // Pairing-level, reader-specific section content (language read, entry
    // brief + detail, glance metrics, fits-you-if) as validated JSONB. This
    // broadens arrival_context into the citizenship × destination pairing
    // record; see docs/domain-model.md.
    profile: jsonb("profile").$type<DestinationPairing>().notNull().default({}),

    ...contentMetadata,
    ...timestamps,
  },
  (table) => [
    uniqueIndex("arrival_context_citizenship_destination_idx").on(
      table.citizenshipId,
      table.destinationCountryId,
    ),
    index("arrival_context_destination_country_id_idx").on(table.destinationCountryId),
  ],
);

export const routeSources = pgTable(
  "route_sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    routeId: uuid("route_id")
      .notNull()
      .references(() => routes.id, { onDelete: "cascade" }),
    type: sourceTypeEnum("type").notNull(),
    label: text("label").notNull(),
    url: text("url").notNull(),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [index("route_sources_route_id_idx").on(table.routeId)],
);
