import type { CountryProfile, CultureNote, LanguageForReader } from "@/lib/destination/types";
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
} from "./section-kit";

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
] as const satisfies readonly SectionMeta[];

const S = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<
  (typeof SECTIONS)[number]["id"],
  SectionMeta
>;

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
  return (
    <div className="space-y-10">
      <ContentMap sections={SECTIONS} />

      <Block {...S.geography}>
        <Prose>{country.geography.location}</Prose>
        <StatGrid stats={country.geography.stats} />
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <Panel caption="Largest cities · million people">
            <ProportionBars data={country.geography.cities} unit="M" />
          </Panel>
          <div className="space-y-3">
            <Caption>Borders {country.geography.borders.length} countries</Caption>
            <TagRow items={country.geography.borders} />
            <Prose>{country.geography.climate}</Prose>
          </div>
        </div>
      </Block>

      <Block {...S.people}>
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

      <Block {...S.economy}>
        <Prose>{country.economy.summary}</Prose>
        <StatGrid stats={country.economy.stats} />
        <div className="space-y-2">
          <Caption>Where the jobs are</Caption>
          <TagRow items={country.economy.industries} />
        </div>
      </Block>

      <Block {...S.government}>
        <Prose>{country.government.summary}</Prose>
        <div className="space-y-2">
          <Caption>{country.government.system} · member of</Caption>
          <TagRow items={country.government.memberships} />
        </div>
        <StatGrid stats={country.government.stats} />
      </Block>

      <Block {...S.rights}>
        <RightsBlock lgbtq={country.rights.lgbtq} minorities={country.rights.minorities} />
      </Block>

      <Block {...S.language}>
        <LanguageBlock language={country.language} />
      </Block>

      <Block {...S.safety}>
        <Prose>{country.safety.summary}</Prose>
        <StatGrid stats={country.safety.stats} />
      </Block>

      <Block {...S.culture}>
        <Prose>{country.culture.summary}</Prose>
        <CultureNotes notes={country.culture.notes} />
      </Block>
    </div>
  );
}
