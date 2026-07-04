import Link from "next/link";
import type { BudgetPersona, LivingProfile, RentRow, TaxBreakdown } from "@/lib/destination/types";
import {
  Block,
  Caption,
  ContentMap,
  Panel,
  PriceList,
  ProportionBars,
  Prose,
  type SectionMeta,
  StatGrid,
} from "./section-kit";

const SECTIONS = [
  { id: "budget", emoji: "💶", title: "Monthly budget" },
  { id: "rent", emoji: "🏠", title: "Rent by city" },
  { id: "prices", emoji: "🛒", title: "Everyday prices" },
  { id: "healthcare", emoji: "⚕️", title: "Healthcare" },
  { id: "schooling", emoji: "🎒", title: "Schooling & childcare" },
  { id: "lifestyle", emoji: "🎟️", title: "Lifestyle" },
] as const satisfies readonly SectionMeta[];

const S = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<
  (typeof SECTIONS)[number]["id"],
  SectionMeta
>;

/** One persona's monthly spend: a headline total and a category breakdown. */
function BudgetCard({ persona }: { persona: BudgetPersona }) {
  return (
    <Panel>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="font-display text-base font-semibold text-(--text)">{persona.label}</p>
          {persona.note && <p className="mt-0.5 text-xs text-(--text-3)">{persona.note}</p>}
        </div>
        <p className="font-display text-2xl font-semibold text-(--brand)">
          {persona.total}
          <span className="text-sm font-medium text-(--text-3)"> /mo</span>
        </p>
      </div>
      <div className="mt-4">
        <ProportionBars data={persona.lines} prefix="€" />
      </div>
    </Panel>
  );
}

/**
 * Compact take-home pointer: the net-pay headline for budgeting, linking into
 * the Work & income view — which owns the full tax and accounting detail.
 */
function TakeHomePointer({ takeHome, workHref }: { takeHome: TaxBreakdown; workHref: string }) {
  return (
    <Link
      href={workHref}
      className="group flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-[var(--radius-md)] border border-(--border) bg-(--surface) px-4 py-3 transition-colors hover:border-(--brand)"
    >
      <span className="text-sm text-(--text-2)">
        Take-home pay{" "}
        <span className="font-display font-semibold text-(--text)">
          €{takeHome.net.toLocaleString("en-US")}
        </span>{" "}
        on €{takeHome.gross.toLocaleString("en-US")} gross
      </span>
      <span className="text-xs font-medium text-(--brand)">
        Full tax picture in Work &amp; income →
      </span>
    </Link>
  );
}

/**
 * Rent comparison: the 1-bed city-centre price as a bar scaled across all
 * cities (the headline magnitude), with outer-ring and family-flat figures as
 * secondary context so the whole picture is one glance.
 */
function RentTable({ rows }: { rows: RentRow[] }) {
  const maxCentre = Math.max(...rows.map((r) => r.centre));
  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li
          key={row.city}
          className="rounded-[var(--radius-md)] border border-(--border) bg-(--surface) px-4 py-3"
        >
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium text-(--text)">
              {row.city}
              {row.note && <span className="ml-1.5 text-xs text-(--text-3)">{row.note}</span>}
            </span>
            <span className="font-display text-base font-semibold tabular-nums text-(--text)">
              €{row.centre.toLocaleString("en-US")}
              <span className="text-xs font-medium text-(--text-3)"> /mo</span>
            </span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-(--radius-pill) bg-(--bar-track)">
            <div
              className="h-full rounded-(--radius-pill) bg-(--brand)"
              style={{ width: `${(row.centre / maxCentre) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex gap-4 text-xs text-(--text-3)">
            <span>Outer ring €{row.outer.toLocaleString("en-US")}</span>
            <span>3-bed family €{row.family.toLocaleString("en-US")}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** The cost-of-living profile — the "Living" section body. */
export function LivingView({
  living,
  takeHome,
  workHref,
}: {
  living: LivingProfile;
  /** Employee take-home from the Work view, shown as a compact budgeting tile. */
  takeHome?: TaxBreakdown;
  workHref: string;
}) {
  return (
    <div className="space-y-10">
      <ContentMap sections={SECTIONS} />

      <Block {...S.budget}>
        <Prose>
          A realistic all-in monthly spend, broken down by household. Rent is the biggest lever, so
          the total swings hard by city — see the next section.
        </Prose>
        <div className="grid gap-4 lg:grid-cols-3">
          {living.budgets.map((persona) => (
            <BudgetCard key={persona.label} persona={persona} />
          ))}
        </div>
        {takeHome && <TakeHomePointer takeHome={takeHome} workHref={workHref} />}
      </Block>

      <Block {...S.rent}>
        <Prose>{living.rent.note}</Prose>
        <div className="space-y-2">
          <Caption>1-bed, city centre · €/mo</Caption>
          <RentTable rows={living.rent.rows} />
        </div>
      </Block>

      <Block {...S.prices}>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Caption>Groceries</Caption>
            <PriceList items={living.groceries} />
          </div>
          <div className="space-y-2">
            <Caption>Eating &amp; drinking out</Caption>
            <PriceList items={living.eatingOut} />
          </div>
        </div>
        <div className="space-y-2">
          <Caption>Monthly essentials</Caption>
          <StatGrid stats={living.essentials} />
        </div>
      </Block>

      <Block {...S.healthcare}>
        <Prose>{living.healthcare.summary}</Prose>
        <StatGrid stats={living.healthcare.stats} />
      </Block>

      <Block {...S.schooling}>
        <Prose>{living.schooling.summary}</Prose>
        <StatGrid stats={living.schooling.stats} />
      </Block>

      <Block {...S.lifestyle}>
        <div className="max-w-xl">
          <PriceList items={living.lifestyle} />
        </div>
      </Block>
    </div>
  );
}
