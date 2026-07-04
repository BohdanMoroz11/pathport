import type { EntryProfile } from "@/lib/destination/types";
import {
  Block,
  Caption,
  ContentMap,
  Prose,
  type SectionMeta,
  StatGrid,
  Steps,
} from "./section-kit";

const SECTIONS = [
  { id: "arrival", emoji: "🛂", title: "How you get in" },
  { id: "protection", emoji: "🛡️", title: "Temporary protection" },
  { id: "documents", emoji: "📄", title: "What to bring" },
  { id: "on-arrival", emoji: "✅", title: "On arrival" },
  { id: "first-steps", emoji: "🧭", title: "First steps" },
] as const satisfies readonly SectionMeta[];

const S = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<
  (typeof SECTIONS)[number]["id"],
  SectionMeta
>;

/** A document checklist — a bordered, divided list with a checkbox glyph. */
function DocList({ items }: { items: string[] }) {
  return (
    <ul className="divide-y divide-(--border) overflow-hidden rounded-[var(--radius-lg)] border border-(--border) bg-(--surface)">
      {items.map((item) => (
        <li key={item} className="flex items-center gap-3 px-4 py-2.5 text-sm text-(--text-2)">
          <span
            aria-hidden="true"
            className="grid size-5 shrink-0 place-items-center rounded-[6px] border border-(--border-strong) text-[11px] text-(--text-3)"
          >
            ☐
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Two columns — what you can and can't do the moment you land. */
function AllowList({ can, cannot }: { can: string[]; cannot: string[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 rounded-[var(--radius-lg)] border border-(--border) border-l-[3px] border-l-(--pos) bg-(--surface) p-5">
        <Caption>You can</Caption>
        <ul className="space-y-1.5">
          {can.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-(--text-2)">
              <span aria-hidden="true" className="text-(--pos)">
                ✓
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2 rounded-[var(--radius-lg)] border border-(--border) border-l-[3px] border-l-(--danger) bg-(--surface) p-5">
        <Caption>Not yet</Caption>
        <ul className="space-y-1.5">
          {cannot.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-(--text-2)">
              <span aria-hidden="true" className="text-(--danger)">
                ✕
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** The arrival profile — the "Entry" section body. */
export function EntryView({ entry }: { entry: EntryProfile }) {
  // The content map only lists sections that are actually present — protection
  // is citizenship-specific and absent for many pairings.
  const sections = SECTIONS.filter((s) => s.id !== "protection" || entry.protection);
  return (
    <div className="space-y-10">
      <ContentMap sections={sections} />

      <Block {...S.arrival}>
        <Prose>{entry.arrival.summary}</Prose>
        <StatGrid stats={entry.arrival.stats} />
      </Block>

      {entry.protection && (
        <Block {...S.protection}>
          <Prose>{entry.protection.summary}</Prose>
          <StatGrid stats={entry.protection.stats} />
        </Block>
      )}

      <Block {...S.documents}>
        <Prose>{entry.documents.summary}</Prose>
        <div className="max-w-xl">
          <DocList items={entry.documents.items} />
        </div>
      </Block>

      <Block {...S["on-arrival"]}>
        <AllowList can={entry.onArrival.can} cannot={entry.onArrival.cannot} />
        <Prose>{entry.onArrival.note}</Prose>
      </Block>

      <Block {...S["first-steps"]}>
        <div className="max-w-2xl">
          <Steps steps={entry.firstSteps} />
        </div>
      </Block>
    </div>
  );
}
