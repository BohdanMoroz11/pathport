import type {
  CountryStat,
  MetricRating,
  PriceItem,
  ShareDatum,
  TaxBreakdown,
} from "@/lib/destination/types";
import { ModuleHeading } from "./overview";
import { TONE_BG, TONE_TEXT } from "./tone";

/**
 * Shared building blocks for the deep destination sections (Country, Living, …):
 * the content-map + anchored-section pattern, stat-tile grids, single-hue
 * proportion bars, tag rows, and score meters. Charts are single-hue and
 * direct-labelled — no categorical palette, every value present without hover —
 * so the whole destination experience reads as one family.
 */

export type SectionMeta = { id: string; emoji: string; title: string };

/**
 * In-page content map: jump straight to a section instead of scrolling. Styled
 * as a row of distinct, tappable chips (not a flat card) so it reads
 * unmistakably as a menu — each item bordered, separated, and hover-lit.
 */
export function ContentMap({ sections }: { sections: readonly SectionMeta[] }) {
  return (
    <nav aria-label="On this page" className="space-y-2.5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-(--text-3)">
        <span aria-hidden="true">↓</span>
        Jump to a section
      </p>
      <ul className="flex flex-wrap gap-2">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-(--border) bg-(--surface) px-3.5 py-2 text-sm font-medium text-(--text-2) shadow-[var(--shadow-sm)] transition-colors hover:border-(--brand) hover:bg-(--brand-soft) hover:text-(--text) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand)"
            >
              <span aria-hidden="true">{s.emoji}</span>
              <span>{s.title}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** A titled, anchored block: coloured emoji heading + body — a section's rhythm. */
export function Block({
  id,
  emoji,
  title,
  children,
}: {
  id: string;
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-6 space-y-4">
      <ModuleHeading emoji={emoji}>{title}</ModuleHeading>
      {children}
    </section>
  );
}

/** Narrative paragraph, capped for readability. */
export function Prose({ children }: { children: React.ReactNode }) {
  return <p className="max-w-2xl text-[0.95rem] leading-7 text-(--text-2)">{children}</p>;
}

/** A small uppercase caption above a chart or list. */
export function Caption({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.06em] text-(--text-3)">{children}</p>
  );
}

/** Compact stat tile grid: a value (tone-tinted), its label, and a qualifier. */
export function StatGrid({ stats }: { stats: CountryStat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-[var(--radius-md)] border border-(--border) bg-(--surface) px-4 py-3"
        >
          <dd
            className={`font-display text-lg font-semibold leading-tight ${
              stat.tone ? TONE_TEXT[stat.tone] : "text-(--text)"
            }`}
          >
            {stat.value}
          </dd>
          <dt className="mt-0.5 text-xs font-medium text-(--text-2)">{stat.label}</dt>
          {stat.note && <p className="mt-0.5 text-[11px] leading-4 text-(--text-3)">{stat.note}</p>}
        </div>
      ))}
    </dl>
  );
}

/**
 * Horizontal proportion bars: single-hue, direct-labelled. `max` scales the
 * track — pass 100 for shares (a small slice reads small) or omit to scale to
 * the largest value (magnitude comparison, e.g. city sizes or money). `prefix`
 * (e.g. "€") and `unit` (e.g. "%") wrap the formatted value.
 */
export function ProportionBars({
  data,
  unit = "",
  prefix = "",
  max,
}: {
  data: ShareDatum[];
  unit?: string;
  prefix?: string;
  max?: number;
}) {
  const scale = max ?? Math.max(...data.map((d) => d.value));
  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-(--text)">
              {d.label}
              {d.note && <span className="ml-1.5 text-xs text-(--text-3)">{d.note}</span>}
            </span>
            <span className="font-display font-medium tabular-nums text-(--text-2)">
              {prefix}
              {d.value.toLocaleString("en-US")}
              {unit}
            </span>
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-(--radius-pill) bg-(--bar-track)">
            <div
              className="h-full rounded-(--radius-pill) bg-(--brand)"
              style={{ width: `${Math.max((d.value / scale) * 100, 2)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** A bordered panel wrapper with an optional caption, for charts. */
export function Panel({ caption, children }: { caption?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-(--border) bg-(--surface) p-5">
      {caption && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.06em] text-(--text-3)">
          {caption}
        </p>
      )}
      {children}
    </div>
  );
}

/** Row of neutral pills — borders, memberships, industries. */
export function TagRow({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-[var(--radius-pill)] border border-(--border) bg-(--surface) px-3 py-1 text-sm text-(--text-2)"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Reference-price list: item → cost, in a bordered divided panel. */
export function PriceList({ items }: { items: PriceItem[] }) {
  return (
    <dl className="divide-y divide-(--border) overflow-hidden rounded-[var(--radius-lg)] border border-(--border) bg-(--surface)">
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-4 px-4 py-2.5">
          <dt className="text-sm text-(--text-2)">
            {item.label}
            {item.note && <span className="ml-1.5 text-xs text-(--text-3)">{item.note}</span>}
          </dt>
          <dd className="shrink-0 font-display text-sm font-medium tabular-nums text-(--text)">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Take-home split: what a sample gross nets after tax + social insurance, drawn
 * as a two-part bar (net vs. deductions). Owned by the Work & income view; the
 * Living view links to it rather than repeating the detail.
 */
export function TakeHome({ tax }: { tax: TaxBreakdown }) {
  const deductions = tax.gross - tax.net;
  const netPct = (tax.net / tax.gross) * 100;
  return (
    <Panel>
      <Caption>{tax.grossLabel}</Caption>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-(--text-3)">Take-home</p>
          <p className="font-display text-2xl font-semibold text-(--brand)">
            €{tax.net.toLocaleString("en-US")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-(--text-3)">Tax & insurance</p>
          <p className="font-display text-lg font-semibold text-(--text-2)">
            €{deductions.toLocaleString("en-US")}
          </p>
        </div>
      </div>
      <div className="mt-3 flex h-3 gap-0.5">
        <div
          className="rounded-l-(--radius-pill) bg-(--brand)"
          style={{ width: `${netPct}%` }}
          role="img"
          aria-label={`Take-home €${tax.net}`}
        />
        <div className="flex-1 rounded-r-(--radius-pill) bg-(--neutral)" aria-hidden="true" />
      </div>
      <p className="mt-1.5 text-xs text-(--text-3)">
        of €{tax.gross.toLocaleString("en-US")} gross · ≈
        {Math.round((deductions / tax.gross) * 100)}% to tax & social insurance
      </p>
    </Panel>
  );
}

/** Segmented good/bad meter (score of max), tone-coloured. */
export function ScoreBar({ rating }: { rating: MetricRating }) {
  return (
    <span className="flex gap-1" role="img" aria-label={`${rating.score} of ${rating.max}`}>
      {Array.from({ length: rating.max }, (_, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length positional segments
          key={i}
          className={`h-2 w-6 rounded-(--radius-pill) ${
            i < rating.score ? TONE_BG[rating.tone] : "bg-(--bar-track)"
          }`}
        />
      ))}
    </span>
  );
}
