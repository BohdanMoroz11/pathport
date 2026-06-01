import { index, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

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

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

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
      .references(() => destinationCountries.id),
    type: routeTypeEnum("type").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
    reviewStatus: reviewStatusEnum("review_status").notNull().default("draft"),
    ...timestamps,
  },
  (table) => [index("routes_destination_country_id_idx").on(table.destinationCountryId)],
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
