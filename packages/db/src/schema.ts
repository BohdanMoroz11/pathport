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

// --- Flexible route detail shape (validated JSONB) -------------------------

export type RouteRequirementGroup = {
  title: string;
  items: string[];
};

/**
 * Still-volatile, route-specific content kept as validated JSONB rather than
 * block tables. Normalize into tables later once real routes show which
 * fields repeat. See docs/domain-model.md.
 */
export type RouteDetails = {
  requirementGroups?: RouteRequirementGroup[];
  documentList?: string[];
  eligibilityNotes?: string[];
  stepNotes?: string[];
  caveats?: string[];
};

// --- Tables ----------------------------------------------------------------

export const citizenships = pgTable("citizenships", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 3 }).notNull().unique(),
  name: text("name").notNull(),
  ...timestamps,
});

export const destinationCountries = pgTable("destination_countries", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 2 }).notNull().unique(),
  name: text("name").notNull(),
  ...timestamps,
});

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
    ...timestamps,
  },
  (table) => [
    uniqueIndex("route_applicability_route_citizenship_idx").on(table.routeId, table.citizenshipId),
    index("route_applicability_citizenship_id_idx").on(table.citizenshipId),
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
