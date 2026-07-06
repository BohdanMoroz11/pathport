import Link from "next/link";
import { sectionHref } from "@/lib/destination/sections";
import type { EntryProfile, PermitPath } from "@/lib/destination/types";
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
  { id: "arrival", emoji: "🛂", title: "Getting in" },
  { id: "documents", emoji: "📄", title: "What to bring" },
  { id: "on-arrival", emoji: "✅", title: "Your first days" },
  { id: "to-permit", emoji: "🪪", title: "Getting a permit" },
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

/**
 * The route options that lead to a permit, each a card that links into the
 * Routes view — so Entry generalizes the "get a permit" step instead of
 * hard-coding one status, and hands off to the routes that own the detail.
 */
function PermitPaths({ paths, routesHref }: { paths: PermitPath[]; routesHref: string }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {paths.map((path) => (
        <li key={path.label}>
          <Link
            href={routesHref}
            className="group flex h-full flex-col rounded-[var(--radius-lg)] border border-(--border) bg-(--surface) p-4 transition-colors hover:border-(--brand) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand)"
          >
            <p className="text-xs font-medium text-(--brand)">{path.forWhom}</p>
            <p className="mt-1 font-display text-sm font-semibold text-(--text)">{path.label}</p>
            <p className="mt-1 text-sm leading-6 text-(--text-2)">{path.note}</p>
            <span className="mt-3 flex items-center gap-1 text-xs font-medium text-(--brand)">
              See routes
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** The arrival-to-permit journey — the "Entry" section body. */
export function EntryView({ entry, basePath }: { entry: EntryProfile; basePath: string }) {
  const routesHref = sectionHref(basePath, "routes");
  return (
    <div className="space-y-10">
      <ContentMap sections={SECTIONS} />

      <Block {...S.arrival}>
        <Prose>{entry.arrival.summary}</Prose>
        <StatGrid stats={entry.arrival.stats} />
      </Block>

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

      <Block {...S["to-permit"]}>
        <Prose>{entry.toPermit.summary}</Prose>
        <div className="max-w-2xl">
          <Steps steps={entry.toPermit.steps} />
        </div>
        <div className="space-y-3">
          <Caption>Pick the route that fits you</Caption>
          <PermitPaths paths={entry.toPermit.paths} routesHref={routesHref} />
        </div>
      </Block>
    </div>
  );
}
