import type {
  CountryProfile,
  CountryStat,
  CultureNote,
  LanguageForReader,
  MetricRating,
  ShareDatum,
} from "@/lib/destination/types";
import { ModuleHeading } from "./overview";
import { TONE_BG, TONE_TEXT } from "./tone";

/* ------------------------------------------------------------------ *
 * Shared primitives — stat tiles, proportion bars, tag rows. Charts are
 * single-hue magnitude/share bars (no categorical palette), and every
 * value is direct-labelled, so the data is fully present without hover.
 * ------------------------------------------------------------------ */

/**
 * The Country view's sections, in order — the single source for both the
 * content map and the anchored blocks, so a jump link can never point at a
 * section that has moved or been renamed.
 */
const SECTIONS = [
  { id: "geography", emoji: "🗺️", title: "Geography & climate" },
  { id: "people", emoji: "👥", title: "People" },
  { id: "economy", emoji: "💶", title: "Economy & jobs" },
  { id: "government", emoji: "🏛️", title: "Government" },
  { id: "rights", emoji: "🤝", title: "Rights & inclusion" },
  { id: "language", emoji: "🗣️", title: "Language" },
  { id: "safety", emoji: "🛡️", title: "Safety" },
  { id: "culture", emoji: "🎭", title: "Culture & everyday life" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const SECTION = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<
  SectionId,
  (typeof SECTIONS)[number]
>;

/**
 * In-page content map: jump straight to a section instead of scrolling. Styled
 * as a row of distinct, tappable chips (not a flat card) so it reads
 * unmistakably as a menu — each item bordered, separated, and hover-lit.
 */
function ContentMap() {
  return (
    <nav aria-label="On this page" className="space-y-2.5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-(--text-3)">
        <span aria-hidden="true">↓</span>
        Jump to a section
      </p>
      <ul className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
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

/** A titled, anchored block: coloured emoji heading + body — the view's rhythm. */
function Block({ id, children }: { id: SectionId; children: React.ReactNode }) {
  const section = SECTION[id];
  return (
    <section id={id} className="scroll-mt-6 space-y-4">
      <ModuleHeading emoji={section.emoji}>{section.title}</ModuleHeading>
      {children}
    </section>
  );
}

/** Narrative paragraph, capped for readability. */
function Prose({ children }: { children: React.ReactNode }) {
  return <p className="max-w-2xl text-[0.95rem] leading-7 text-(--text-2)">{children}</p>;
}

/** Compact stat tile grid: a value (tone-tinted), its label, and a qualifier. */
function StatGrid({ stats }: { stats: CountryStat[] }) {
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
 * the largest value (magnitude comparison, e.g. city sizes).
 */
function ProportionBars({ data, unit, max }: { data: ShareDatum[]; unit: string; max?: number }) {
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
              {d.value}
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
function Panel({ caption, children }: { caption?: string; children: React.ReactNode }) {
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
function TagRow({ items }: { items: string[] }) {
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

/** Segmented good/bad meter (score of max), tone-coloured — the language read. */
function ScoreBar({ rating }: { rating: MetricRating }) {
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

/* ------------------------------------------------------------------ *
 * Section blocks
 * ------------------------------------------------------------------ */

/**
 * Language read from the visitor's point of view: which language runs daily
 * life, how hard it is *for them*, and how far English alone carries — not a
 * generic "English is widely spoken" line.
 */
function LanguageBlock({ language }: { language: LanguageForReader }) {
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
      <Panel caption="How hard for you">
        <div className="flex items-center justify-between gap-4">
          <span className="font-display text-lg font-semibold text-(--text)">
            {language.difficulty.label}
          </span>
          <ScoreBar rating={language.difficulty.rating} />
        </div>
        <p className="mt-3 text-sm leading-6 text-(--text-2)">{language.difficulty.note}</p>
      </Panel>
      <Panel caption="Getting by in English">
        <p className="text-sm leading-6 text-(--text-2)">{language.english}</p>
        {language.official.length > 0 && (
          <p className="mt-3 text-xs text-(--text-3)">Official: {language.official.join(", ")}</p>
        )}
      </Panel>
    </div>
  );
}

/** Culture / everyday-life notes as a two-column card grid. */
function CultureNotes({ notes }: { notes: CultureNote[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {notes.map((note) => (
        <li
          key={note.title}
          className="rounded-[var(--radius-md)] border border-(--border) bg-(--surface) p-4"
        >
          <p className="font-display text-sm font-semibold text-(--text)">{note.title}</p>
          <p className="mt-1 text-sm leading-6 text-(--text-2)">{note.body}</p>
        </li>
      ))}
    </ul>
  );
}

/** Two stacked prose blocks under labelled headers, for the rights read. */
function RightsBlock({ lgbtq, minorities }: { lgbtq: string; minorities: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[
        { label: "LGBTQ+", body: lgbtq },
        { label: "Minorities & migrants", body: minorities },
      ].map((item) => (
        <div
          key={item.label}
          className="rounded-[var(--radius-lg)] border border-(--border) bg-(--surface) p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-(--text-3)">
            {item.label}
          </p>
          <p className="mt-2 text-sm leading-6 text-(--text-2)">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * The Country view
 * ------------------------------------------------------------------ */

/** The deep country profile — the "Country" section body. */
export function CountryView({ country }: { country: CountryProfile }) {
  return (
    <div className="space-y-10">
      <ContentMap />

      <Block id="geography">
        <Prose>{country.geography.location}</Prose>
        <StatGrid stats={country.geography.stats} />
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Panel caption="Largest cities · million people">
            <ProportionBars data={country.geography.cities} unit="M" />
          </Panel>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-(--text-3)">
              Borders {country.geography.borders.length} countries
            </p>
            <TagRow items={country.geography.borders} />
            <Prose>{country.geography.climate}</Prose>
          </div>
        </div>
      </Block>

      <Block id="people">
        <StatGrid stats={country.people.stats} />
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel caption="Age distribution · % of population">
            <ProportionBars data={country.people.ageBands} unit="%" max={100} />
          </Panel>
          <Panel caption="Religious affiliation · % of population">
            <ProportionBars data={country.people.religions} unit="%" max={100} />
          </Panel>
        </div>
      </Block>

      <Block id="economy">
        <Prose>{country.economy.summary}</Prose>
        <StatGrid stats={country.economy.stats} />
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-(--text-3)">
            Where the jobs are
          </p>
          <TagRow items={country.economy.industries} />
        </div>
      </Block>

      <Block id="government">
        <Prose>{country.government.summary}</Prose>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.06em] text-(--text-3)">
            {country.government.system} · member of
          </p>
          <TagRow items={country.government.memberships} />
        </div>
        <StatGrid stats={country.government.stats} />
      </Block>

      <Block id="rights">
        <RightsBlock lgbtq={country.rights.lgbtq} minorities={country.rights.minorities} />
      </Block>

      <Block id="language">
        <LanguageBlock language={country.language} />
      </Block>

      <Block id="safety">
        <Prose>{country.safety.summary}</Prose>
        <StatGrid stats={country.safety.stats} />
      </Block>

      <Block id="culture">
        <Prose>{country.culture.summary}</Prose>
        <CultureNotes notes={country.culture.notes} />
      </Block>
    </div>
  );
}
