import type {
  ClimateSeason,
  CountryProfile,
  CultureNote,
  GeoImage,
  LanguageForReader,
  RegionNote,
} from "@/lib/destination/types";
import { EconomyTrend } from "./economy-trend";
import {
  Block,
  Caption,
  ContentMap,
  Panel,
  ProportionBars,
  Prose,
  ScoreBar,
  type SectionMeta,
  StatGrid,
  TagRow,
  Timeline,
  TrendBadge,
} from "./section-kit";
import { TONE_BG } from "./tone";

/**
 * The Country view's sections, in order — the single source for both the
 * content map and the anchored blocks, so a jump link can never point at a
 * section that has moved or been renamed.
 */
const SECTIONS = [
  { id: "geography", emoji: "🗺️", title: "Geography & climate" },
  { id: "people", emoji: "👥", title: "People" },
  { id: "economy", emoji: "💶", title: "Economy" },
  { id: "government", emoji: "🏛️", title: "Government" },
  { id: "rights", emoji: "🤝", title: "Rights & inclusion" },
  { id: "language", emoji: "🗣️", title: "Language" },
  { id: "safety", emoji: "🛡️", title: "Safety" },
  { id: "culture", emoji: "🎭", title: "Culture & everyday life" },
] as const satisfies readonly SectionMeta[];

const S = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<
  (typeof SECTIONS)[number]["id"],
  SectionMeta
>;

/** Captioned image placeholders — real photography is a known asset upgrade. */
function ImageGallery({ images }: { images: GeoImage[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3">
      {images.map((image) => (
        <li
          key={image.caption}
          className="overflow-hidden rounded-[var(--radius-lg)] border border-(--border) bg-(--surface)"
        >
          <div
            aria-hidden="true"
            className="grid aspect-[16/10] place-items-center bg-(--surface-2) text-2xl text-(--text-3)"
          >
            🏞️
          </div>
          <p className="px-3 py-2 text-xs leading-5 text-(--text-2)">{image.caption}</p>
        </li>
      ))}
    </ul>
  );
}

/** Seasonal weather breakdown — temperature and rain/snow across the year. */
function ClimateSeasons({ seasons }: { seasons: ClimateSeason[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {seasons.map((season) => (
        <li
          key={season.label}
          className="rounded-[var(--radius-md)] border border-(--border) bg-(--surface) p-4"
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-display text-sm font-semibold text-(--text)">{season.label}</p>
            <p className="text-xs text-(--text-3)">{season.months}</p>
          </div>
          <p className="mt-2 font-display text-lg font-semibold tabular-nums text-(--text)">
            {season.temp}
          </p>
          <p className="mt-1 text-xs leading-5 text-(--text-2)">{season.precip}</p>
          {season.note && <p className="mt-1 text-[11px] text-(--text-3)">{season.note}</p>}
        </li>
      ))}
    </ul>
  );
}

/** How safety varies by area — a tone-dotted list, not a whole-region verdict. */
function RegionAreas({ areas }: { areas: RegionNote[] }) {
  return (
    <ul className="space-y-2">
      {areas.map((area) => (
        <li
          key={area.label}
          className="flex gap-3 rounded-[var(--radius-md)] border border-(--border) bg-(--surface) px-4 py-3"
        >
          <span
            aria-hidden="true"
            className={`mt-1.5 size-2 shrink-0 rounded-full ${TONE_BG[area.tone ?? "neutral"]}`}
          />
          <span className="min-w-0">
            <span className="text-sm font-medium text-(--text)">{area.label}</span>
            <span className="mt-0.5 block text-sm leading-6 text-(--text-2)">{area.note}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

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
          <Caption>{item.label}</Caption>
          <p className="mt-2 text-sm leading-6 text-(--text-2)">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

/** The deep country profile — the "Country" section body. */
export function CountryView({ country }: { country: CountryProfile }) {
  const { geography, people, economy, government, safety } = country;
  return (
    <div className="space-y-10">
      <ContentMap sections={SECTIONS} />

      <Block {...S.geography}>
        <Prose>{geography.location}</Prose>
        <ImageGallery images={geography.images} />
        <StatGrid stats={geography.stats} />
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Panel caption="Largest cities · million people">
            <ProportionBars data={geography.cities} unit="M" />
          </Panel>
          <div className="space-y-3">
            <Caption>Borders {geography.borders.length} countries</Caption>
            <TagRow items={geography.borders} />
          </div>
        </div>
        <div className="space-y-4">
          <Caption>Climate</Caption>
          <Prose>{geography.climate.summary}</Prose>
          <ClimateSeasons seasons={geography.climate.seasons} />
          <p className="max-w-2xl text-sm leading-6 text-(--text-3)">
            {geography.climate.stability}
          </p>
        </div>
      </Block>

      <Block {...S.people}>
        <Prose>{people.summary}</Prose>
        <StatGrid stats={people.stats} />
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel caption="Age distribution · % of population">
            <ProportionBars data={people.ageBands} unit="%" max={100} />
          </Panel>
          <Panel caption="Religious affiliation · % of population">
            <ProportionBars data={people.religions} unit="%" max={100} />
          </Panel>
        </div>
      </Block>

      <Block {...S.economy}>
        <Prose>{economy.summary}</Prose>
        <StatGrid stats={economy.stats} />
        <div className="space-y-3">
          <Caption>Trends over time</Caption>
          <EconomyTrend series={economy.trends} />
        </div>
      </Block>

      <Block {...S.government}>
        <Prose>{government.summary}</Prose>
        <div className="space-y-2">
          <Caption>{government.system} · member of</Caption>
          <TagRow items={government.memberships} />
        </div>
        <StatGrid stats={government.stats} />
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Panel caption="Parliament · % of seats">
            <ProportionBars data={government.parties} unit="%" max={100} />
          </Panel>
          <div className="space-y-4">
            <div className="rounded-[var(--radius-lg)] border border-(--border) bg-(--surface) p-5">
              <Caption>In power now</Caption>
              <p className="mt-2 text-sm leading-6 text-(--text-2)">
                {government.currentGovernment}
              </p>
              <p className="mt-3 inline-flex rounded-[var(--radius-pill)] border border-(--border) bg-(--surface-2) px-3 py-1 text-xs font-medium text-(--text-2)">
                🗳️ {government.nextElection}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <Caption>Recent governments</Caption>
          <Timeline entries={government.timeline} />
        </div>
      </Block>

      <Block {...S.rights}>
        <RightsBlock lgbtq={country.rights.lgbtq} minorities={country.rights.minorities} />
      </Block>

      <Block {...S.language}>
        <LanguageBlock language={country.language} />
      </Block>

      <Block {...S.safety}>
        <div className="flex flex-wrap items-center gap-3">
          <TrendBadge direction={safety.trend.direction} />
          <p className="text-sm text-(--text-3)">Recent trend</p>
        </div>
        <Prose>{safety.summary}</Prose>
        <StatGrid stats={safety.stats} />
        <p className="max-w-2xl text-sm leading-6 text-(--text-2)">{safety.trend.note}</p>
        <div className="space-y-3">
          <Caption>How it varies by area</Caption>
          <Prose>{safety.regional.summary}</Prose>
          <RegionAreas areas={safety.regional.areas} />
        </div>
      </Block>

      <Block {...S.culture}>
        <Prose>{country.culture.summary}</Prose>
        <CultureNotes notes={country.culture.notes} />
      </Block>
    </div>
  );
}
