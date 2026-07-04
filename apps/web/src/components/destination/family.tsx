import type { AccentTone, FamilyMember, FamilyProfile } from "@/lib/destination/types";
import {
  Block,
  Caption,
  ContentMap,
  Prose,
  type SectionMeta,
  StatGrid,
  Steps,
} from "./section-kit";
import { TONE_BORDER } from "./tone";

const SECTIONS = [
  { id: "reunification", emoji: "🧩", title: "Reunification" },
  { id: "who", emoji: "👥", title: "Who you can bring" },
  { id: "perks", emoji: "🎁", title: "What family gets" },
  { id: "pets", emoji: "🐾", title: "Bringing pets" },
] as const satisfies readonly SectionMeta[];

const S = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<
  (typeof SECTIONS)[number]["id"],
  SectionMeta
>;

/** How feasible bringing a family member is — the yes/maybe/no read as a marker. */
const FEASIBILITY: Record<
  FamilyMember["feasibility"],
  { glyph: string; classes: string; tone: AccentTone; label: string }
> = {
  yes: { glyph: "✓", classes: "bg-(--pos-soft) text-(--pos)", tone: "pos", label: "A clear right" },
  maybe: {
    glyph: "~",
    classes: "bg-(--warn-soft) text-(--warn)",
    tone: "warn",
    label: "Case by case",
  },
  no: {
    glyph: "✕",
    classes: "bg-(--danger-soft) text-(--danger)",
    tone: "danger",
    label: "Hardship only",
  },
};

/** One person you might bring: feasibility marker, who they are, and conditions. */
function MemberCard({ member }: { member: FamilyMember }) {
  const marker = FEASIBILITY[member.feasibility];
  return (
    <div
      className={`space-y-3 rounded-[var(--radius-lg)] border border-(--border) border-l-[3px] bg-(--surface) p-5 ${TONE_BORDER[marker.tone]}`}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${marker.classes}`}
        >
          {marker.glyph}
        </span>
        <div className="min-w-0">
          <p className="font-display text-base font-semibold text-(--text)">{member.label}</p>
          <p className="mt-0.5 text-sm text-(--text-2)">{member.tagline}</p>
        </div>
        <span className="ml-auto shrink-0 text-[11px] font-semibold uppercase tracking-[0.06em] text-(--text-3)">
          {marker.label}
        </span>
      </div>
      <ul className="space-y-1 border-t border-(--border) pt-3">
        {member.conditions.map((cond) => (
          <li key={cond} className="flex gap-2 text-sm text-(--text-2)">
            <span aria-hidden="true" className="text-(--text-3)">
              •
            </span>
            {cond}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Danger-tinted tag list, for the restricted / banned dog breeds. */
function RestrictedTags({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-[var(--radius-pill)] bg-(--danger-soft) px-3 py-1 text-sm font-medium text-(--danger)"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** The family & pets profile — the "Family & pets" section body. */
export function FamilyView({ family }: { family: FamilyProfile }) {
  return (
    <div className="space-y-10">
      <ContentMap sections={SECTIONS} />

      <Block {...S.reunification}>
        <Prose>{family.reunification.summary}</Prose>
        <StatGrid stats={family.reunification.stats} />
      </Block>

      <Block {...S.who}>
        <div className="grid gap-4 sm:grid-cols-2">
          {family.members.map((member) => (
            <MemberCard key={member.label} member={member} />
          ))}
        </div>
      </Block>

      <Block {...S.perks}>
        <Prose>{family.perks.summary}</Prose>
        <StatGrid stats={family.perks.stats} />
      </Block>

      <Block {...S.pets}>
        <Prose>{family.pets.summary}</Prose>
        <div className="grid items-start gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-2">
            <Caption>Bringing a cat, dog, or ferret</Caption>
            <Steps steps={family.pets.checklist} />
          </div>
          <div className="space-y-4">
            <StatGrid stats={family.pets.stats} />
            <div className="space-y-2">
              <Caption>Banned from import</Caption>
              <RestrictedTags items={family.pets.restricted} />
            </div>
          </div>
        </div>
        <Prose>{family.pets.note}</Prose>
      </Block>
    </div>
  );
}
