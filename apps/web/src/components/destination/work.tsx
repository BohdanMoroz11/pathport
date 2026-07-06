import type {
  DemandField,
  EarningMode,
  IncomeLane,
  SetupTrack,
  WorkProfile,
} from "@/lib/destination/types";
import { EconomyTrend } from "./economy-trend";
import {
  Block,
  Caption,
  ContentMap,
  PriceList,
  Prose,
  type SectionMeta,
  StatGrid,
  Steps,
  TagRow,
  TakeHome,
} from "./section-kit";

const SECTIONS = [
  { id: "right-to-work", emoji: "🪪", title: "Right to work" },
  { id: "modes", emoji: "🧭", title: "Ways to earn" },
  { id: "income-tax", emoji: "🧾", title: "Income & tax" },
  { id: "finding", emoji: "🔎", title: "Finding work" },
  { id: "setup", emoji: "📝", title: "Getting set up" },
  { id: "credentials", emoji: "🎓", title: "Recognising your degree" },
  { id: "demand", emoji: "📈", title: "What's in demand" },
] as const satisfies readonly SectionMeta[];

const S = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<
  (typeof SECTIONS)[number]["id"],
  SectionMeta
>;

/** One way to earn: its tax/setup shape plus the honest pros and cons. */
function ModeCard({ mode }: { mode: EarningMode }) {
  return (
    <div className="space-y-4 rounded-[var(--radius-lg)] border border-(--border) bg-(--surface) p-5">
      <div>
        <p className="font-display text-base font-semibold text-(--text)">{mode.label}</p>
        <p className="mt-0.5 text-sm text-(--text-2)">{mode.tagline}</p>
      </div>
      <dl className="space-y-1.5 text-sm">
        <div className="flex gap-2.5">
          <dt className="w-12 shrink-0 pt-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-(--text-3)">
            Tax
          </dt>
          <dd className="text-(--text-2)">{mode.taxNote}</dd>
        </div>
        <div className="flex gap-2.5">
          <dt className="w-12 shrink-0 pt-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-(--text-3)">
            Setup
          </dt>
          <dd className="text-(--text-2)">{mode.setupNote}</dd>
        </div>
      </dl>
      <div className="grid gap-x-4 gap-y-1 border-t border-(--border) pt-3 sm:grid-cols-2">
        <ul className="space-y-1">
          {mode.pros.map((p) => (
            <li key={p} className="flex gap-1.5 text-sm text-(--text-2)">
              <span aria-hidden="true" className="text-(--pos)">
                ✓
              </span>
              {p}
            </li>
          ))}
        </ul>
        <ul className="space-y-1">
          {mode.cons.map((c) => (
            <li key={c} className="flex gap-1.5 text-sm text-(--text-2)">
              <span aria-hidden="true" className="text-(--text-3)">
                ✕
              </span>
              {c}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Effective tax burden across earning modes, as compact stat tiles. */
function IncomeLanes({ lanes }: { lanes: IncomeLane[] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-3">
      {lanes.map((lane) => (
        <div
          key={lane.mode}
          className="rounded-[var(--radius-md)] border border-(--border) bg-(--surface) px-4 py-3"
        >
          <dt className="text-[11px] font-semibold uppercase tracking-[0.06em] text-(--text-3)">
            {lane.mode}
          </dt>
          <dd className="mt-0.5 font-display text-lg font-semibold text-(--text)">{lane.burden}</dd>
          <p className="mt-0.5 text-xs leading-4 text-(--text-3)">{lane.note}</p>
        </div>
      ))}
    </dl>
  );
}

/** In-demand fields as detail cards: why it's short-staffed and typical pay. */
function DemandFields({ fields }: { fields: DemandField[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {fields.map((field) => (
        <li
          key={field.label}
          className="rounded-[var(--radius-md)] border border-(--border) border-l-[3px] border-l-(--pos) bg-(--surface) p-4"
        >
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-display text-sm font-semibold text-(--text)">{field.label}</p>
            {field.pay && (
              <p className="shrink-0 font-display text-xs font-medium tabular-nums text-(--pos)">
                {field.pay}
              </p>
            )}
          </div>
          <p className="mt-1 text-sm leading-6 text-(--text-2)">{field.why}</p>
        </li>
      ))}
    </ul>
  );
}

/** The setup tracks per earning mode: a labelled sub-sequence of steps. */
function SetupTracks({ tracks }: { tracks: SetupTrack[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {tracks.map((track) => (
        <div key={track.mode} className="space-y-3">
          <div>
            <p className="font-display text-sm font-semibold text-(--text)">{track.mode}</p>
            <p className="mt-0.5 text-xs leading-5 text-(--text-3)">{track.note}</p>
          </div>
          <Steps steps={track.steps} />
        </div>
      ))}
    </div>
  );
}

/** The work & income profile — the "Work & income" section body. */
export function WorkView({ work }: { work: WorkProfile }) {
  return (
    <div className="space-y-10">
      <ContentMap sections={SECTIONS} />

      <Block {...S["right-to-work"]}>
        <Prose>{work.rightToWork.summary}</Prose>
        <StatGrid stats={work.rightToWork.stats} />
      </Block>

      <Block {...S.modes}>
        <div className="grid gap-4 sm:grid-cols-2">
          {work.modes.map((mode) => (
            <ModeCard key={mode.label} mode={mode} />
          ))}
        </div>
      </Block>

      <Block {...S["income-tax"]}>
        <Prose>{work.incomeTax.summary}</Prose>
        <div className="grid items-start gap-4 lg:grid-cols-[1.15fr_1fr]">
          <TakeHome tax={work.incomeTax.takeHome} />
          <div className="space-y-2">
            <Caption>Where it goes</Caption>
            <PriceList items={work.incomeTax.takeHome.deductions} />
          </div>
        </div>
        <div className="space-y-2">
          <Caption>Effective burden by earning mode</Caption>
          <IncomeLanes lanes={work.incomeTax.lanes} />
        </div>
        <div className="space-y-3">
          <Caption>How the tax burden has moved</Caption>
          <EconomyTrend series={work.incomeTax.trends} />
        </div>
        <Prose>{work.incomeTax.accounting}</Prose>
      </Block>

      <Block {...S.finding}>
        <Prose>{work.finding.summary}</Prose>
        <div className="space-y-2">
          <Caption>Where to look</Caption>
          <TagRow items={work.finding.channels} />
        </div>
      </Block>

      <Block {...S.setup}>
        <Prose>{work.setup.summary}</Prose>
        <div className="space-y-3">
          <Caption>Everyone does this first</Caption>
          <div className="max-w-2xl">
            <Steps steps={work.setup.general} />
          </div>
        </div>
        <div className="space-y-3">
          <Caption>Then, depending on how you work</Caption>
          <SetupTracks tracks={work.setup.byMode} />
        </div>
      </Block>

      <Block {...S.credentials}>
        <Prose>{work.credentials.summary}</Prose>
        <StatGrid stats={work.credentials.stats} />
      </Block>

      <Block {...S.demand}>
        <Prose>{work.demand.summary}</Prose>
        <div className="space-y-2">
          <Caption>Sectors hiring</Caption>
          <TagRow items={work.industries} />
        </div>
        <div className="space-y-2">
          <Caption>Most-wanted roles</Caption>
          <DemandFields fields={work.demand.inDemand} />
        </div>
        <div className="space-y-2">
          <Caption>More competitive</Caption>
          <TagRow items={work.demand.saturated} />
        </div>
        <Prose>{work.demand.note}</Prose>
      </Block>
    </div>
  );
}
