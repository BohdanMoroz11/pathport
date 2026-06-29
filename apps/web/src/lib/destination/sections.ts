/**
 * The destination experience is an app-shell whose left rail switches between
 * section views (real routes), not scroll anchors — see docs/design-direction.md
 * and the Phase 2 / S3 plan. This is the single source of truth for that nav, so
 * the rail and the Overview "explore" grid stay in sync.
 *
 * The set is deliberately *not* the throwaway UI concept's seven sections:
 * "Sources" is not a view (sources live inline next to the data they back), and
 * cost/taxes/healthcare/schooling are folded into one "Living" view. Treated as
 * the current target shape, expected to move as the deeper views are built.
 */
export type DestinationSection = {
  /** URL segment under the destination base; "" is the Overview index. */
  slug: string;
  label: string;
  /** Placeholder icon; a real icon set (e.g. Lucide) is a known upgrade. */
  emoji: string;
  blurb: string;
};

export const DESTINATION_SECTIONS: DestinationSection[] = [
  {
    slug: "",
    label: "Overview",
    emoji: "\u{1F9ED}",
    blurb: "The headline of every section, at a glance.",
  },
  {
    slug: "country",
    label: "Country",
    emoji: "\u{1F30D}",
    blurb: "Where it is, who lives there, the economy, politics, and culture.",
  },
  {
    slug: "routes",
    label: "Routes",
    emoji: "\u{1F5C2}\u{FE0F}",
    blurb: "Every long-term route, compared on the same scales.",
  },
  {
    slug: "living",
    label: "Living",
    emoji: "\u{1F3E0}",
    blurb: "Real costs by city, taxes, healthcare, and schooling for kids.",
  },
  {
    slug: "family",
    label: "Family & pets",
    emoji: "\u{1F46A}",
    blurb: "Bringing partners, children, parents — and animals.",
  },
  {
    slug: "entry",
    label: "Entry",
    emoji: "\u{1F6C2}",
    blurb: "Visa-free terms and how you first arrive.",
  },
];

/** Everything except the Overview index — what the Overview links out to. */
export const DESTINATION_SUBSECTIONS = DESTINATION_SECTIONS.filter((s) => s.slug !== "");

/** Look up a section by its URL slug ("" for the Overview index). */
export function sectionBySlug(slug: string): DestinationSection | undefined {
  return DESTINATION_SECTIONS.find((section) => section.slug === slug);
}

/** Base path for a destination shell, e.g. `/explore/UKR/DE`. */
export function destinationBasePath(citizenship: string, destination: string): string {
  return `/explore/${citizenship}/${destination}`;
}

/** Absolute href for a section within a destination shell. */
export function sectionHref(basePath: string, slug: string): string {
  return slug ? `${basePath}/${slug}` : basePath;
}
