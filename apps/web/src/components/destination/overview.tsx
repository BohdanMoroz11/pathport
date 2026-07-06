import type {
  AccentTone,
  EntryBrief as EntryBriefData,
  FitSignal,
  GlanceMetric,
  MetricRating,
  QuickFact,
} from "@pathport/contracts";
import Link from "next/link";
import { sectionHref } from "@/lib/destination/sections";
import { TONE_BG, TONE_BORDER, TONE_TEXT } from "./tone";

/**
 * Short, citizenship-specific entry read, as a brand-accented callout linking
 * into the Entry view — the editorial anchor of the hero. Arrival is
 * decision-critical, so it earns the most prominent spot after the description.
 */
export function EntryBrief({ entry, basePath }: { entry: EntryBriefData; basePath: string }) {
  return (
    <Link
      href={sectionHref(basePath, "entry")}
      className="group block rounded-[var(--radius-lg)] border border-(--brand-soft) bg-(--brand-soft) p-5 transition hover:border-(--brand) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand)"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-(--brand)">
          <span aria-hidden="true">{"\u{1F6C2}"}</span>
          Getting in
        </span>
        <ChevronRight />
      </div>
      <p className="mt-2 text-lg font-medium leading-7 text-(--text)">{entry.summary}</p>
      {entry.facts.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {entry.facts.map((fact) => (
            <li
              key={fact.label}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-(--border) bg-(--surface) px-3 py-1 text-sm"
            >
              <span className="text-(--text-3)">{fact.label}</span>
              <span className="font-display font-medium text-(--text)">{fact.value}</span>
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}

/** Small emoji + label heading shared by the Overview modules. */
export function ModuleHeading({ emoji, children }: { emoji: string; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-(--text)">
      <span aria-hidden="true">{emoji}</span>
      {children}
    </h2>
  );
}

/**
 * Flat country silhouette, themed via CSS `mask` so it recolours with the token
 * (no inline path data, no <img> colour lock). SVGs are static assets under
 * /public/maps (source: mapsicon, MIT).
 */
function CountrySilhouette({ code, name }: { code: string; name: string }) {
  const src = `/maps/${code.toLowerCase()}.svg`;
  return (
    <div
      role="img"
      aria-label={`Outline map of ${name}`}
      className="size-full bg-(--text-3)"
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
    />
  );
}

/**
 * Identity card: flag, name, the country outline, and the quick facts folded in
 * (capital, language, currency, …) so the hero has no dead column.
 */
export function DestinationMedia({
  flag,
  name,
  code,
  facts,
}: {
  flag: string;
  name: string;
  code: string;
  facts: QuickFact[];
}) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-(--border) bg-(--surface) shadow-[var(--shadow-sm)]">
      <div className="aspect-[16/10] bg-(--surface-2) p-5">
        <CountrySilhouette code={code} name={name} />
      </div>
      <div className="flex items-center gap-3 px-4 pt-4">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-(--surface-2) text-2xl"
        >
          {flag}
        </span>
        <p className="font-display text-lg font-semibold text-(--text)">{name}</p>
      </div>
      <dl className="mt-3 divide-y divide-(--border) border-t border-(--border)">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-center justify-between gap-4 px-4 py-2.5">
            <dt className="text-sm text-(--text-2)">{fact.label}</dt>
            <dd className="font-display text-sm font-medium text-(--text)">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Good/bad indicator: a filled segment bar (`score` of `max`), tone-coloured. */
function RatingBar({ rating }: { rating: MetricRating }) {
  return (
    <span className="flex gap-1" role="img" aria-label={`${rating.score} of ${rating.max}`}>
      {Array.from({ length: rating.max }, (_, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length positional segments
          key={i}
          className={`h-2 w-5 rounded-(--radius-pill) ${i < rating.score ? TONE_BG[rating.tone] : "bg-(--bar-track)"}`}
        />
      ))}
    </span>
  );
}

function ChevronRight() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-(--text-3) transition-colors group-hover:text-(--brand)"
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function MetricRow({ metric }: { metric: GlanceMetric }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <span className="w-28 shrink-0 text-sm text-(--text-2) sm:w-36">{metric.label}</span>
      <span className="min-w-0 flex-1">
        <span
          className={`block font-display text-sm font-semibold sm:text-base ${
            metric.valueTone ? TONE_TEXT[metric.valueTone] : "text-(--text)"
          }`}
        >
          {metric.value}
        </span>
        {metric.note && (
          <span className="mt-0.5 block text-xs leading-4 text-(--text-3)">{metric.note}</span>
        )}
      </span>
      <span className="shrink-0">{metric.rating && <RatingBar rating={metric.rating} />}</span>
    </div>
  );
}

/** "At a glance" as a structured, deep-linkable spec list (not cards). */
export function GlanceList({ metrics, basePath }: { metrics: GlanceMetric[]; basePath: string }) {
  return (
    <ul className="divide-y divide-(--border) overflow-hidden rounded-[var(--radius-lg)] border border-(--border) bg-(--surface)">
      {metrics.map((metric) => (
        <li key={metric.label}>
          {metric.section ? (
            <Link
              href={sectionHref(basePath, metric.section)}
              className="group flex items-center transition-colors hover:bg-(--surface-2) focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-(--brand)"
            >
              <span className="flex-1">
                <MetricRow metric={metric} />
              </span>
              <span className="pr-4">
                <ChevronRight />
              </span>
            </Link>
          ) : (
            <MetricRow metric={metric} />
          )}
        </li>
      ))}
    </ul>
  );
}

const FIT_MARKER: Record<
  FitSignal["match"],
  { glyph: string; classes: string; tone: AccentTone; label: string }
> = {
  yes: { glyph: "✓", classes: "bg-(--pos-soft) text-(--pos)", tone: "pos", label: "Likely fits" },
  maybe: { glyph: "~", classes: "bg-(--warn-soft) text-(--warn)", tone: "warn", label: "May fit" },
  no: {
    glyph: "✕",
    classes: "bg-(--danger-soft) text-(--danger)",
    tone: "danger",
    label: "Unlikely",
  },
};

/** Citizenship-specific "this fits you if…" signals, with supporting detail. */
export function FitsYou({ items }: { items: FitSignal[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => {
        const marker = FIT_MARKER[item.match];
        return (
          <li
            key={item.text}
            className={`flex gap-3 rounded-[var(--radius-md)] border border-(--border) border-l-[3px] bg-(--surface) px-4 py-3 ${TONE_BORDER[marker.tone]}`}
          >
            <span
              aria-hidden="true"
              className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${marker.classes}`}
            >
              {marker.glyph}
            </span>
            <span className="min-w-0">
              <span className="sr-only">{marker.label}: </span>
              <span className="text-sm font-medium text-(--text)">{item.text}</span>
              {item.detail && (
                <span className="mt-0.5 block text-xs leading-5 text-(--text-2)">
                  {item.detail}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
