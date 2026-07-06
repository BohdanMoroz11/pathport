"use client";

import type { RouteSummary } from "@pathport/contracts";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatCost, formatTimeline, ROUTE_TYPE_LABELS } from "@/lib/format";
import { deriveQualityLabels } from "@/lib/quality";
import { ROUTE_SORTS, type RouteSort, routeSignals, sortRoutes } from "@/lib/route-view";
import { QualityBadges } from "../quality-badge";
import { TONE_BG } from "./tone";

/** The shared magnitude scales the whole list is plotted against. */
type Scale = { cost: number; timeline: number };

/**
 * A single magnitude bar on a scale shared across every route in the list, so
 * "more expensive" and "slower" read at a glance. Single-hue and direct-labelled
 * (per the data-viz guidance) — an unknown value shows "Not specified" rather
 * than a misleading empty or zero bar.
 */
function ScaleBar({
  label,
  value,
  max,
  display,
}: {
  label: string;
  /** The magnitude to plot (upper bound of the range), or null when unknown. */
  value: number | null;
  max: number;
  /** The display-ready range string, e.g. "€100 – €140". */
  display: string;
}) {
  return (
    <div className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 text-sm">
      <span className="text-xs font-medium uppercase tracking-[0.04em] text-(--text-3)">
        {label}
      </span>
      <span className="h-2 overflow-hidden rounded-(--radius-pill) bg-(--bar-track)">
        {value !== null && max > 0 && (
          <span
            className="block h-full rounded-(--radius-pill) bg-(--brand)"
            style={{ width: `${Math.max((value / max) * 100, 3)}%` }}
          />
        )}
      </span>
      <span
        className={`text-right font-display text-sm tabular-nums ${
          value === null ? "text-(--text-3)" : "text-(--text-2)"
        }`}
      >
        {display}
      </span>
    </div>
  );
}

/** The tone-coded ordinal signals (work rights, PR, family, renewable). */
function SignalPills({ route }: { route: RouteSummary }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {routeSignals(route).map((signal) => (
        <li
          key={signal.label}
          className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border border-(--border) bg-(--surface) px-2.5 py-1 text-xs text-(--text-2)"
        >
          <span aria-hidden="true" className={`size-1.5 rounded-full ${TONE_BG[signal.tone]}`} />
          {signal.value}
        </li>
      ))}
    </ul>
  );
}

/** One route as a comparison card; the whole card links into the peek drawer. */
function RouteRow({
  route,
  basePath,
  scale,
}: {
  route: RouteSummary;
  basePath: string;
  scale: Scale;
}) {
  return (
    <li>
      <Link
        href={`${basePath}/routes/${route.id}`}
        scroll={false}
        className="group block space-y-4 rounded-[var(--radius-lg)] border border-(--border) bg-(--surface) p-5 shadow-[var(--shadow-sm)] transition-colors hover:border-(--brand) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand)"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <h3 className="font-display text-base font-semibold text-(--text)">{route.title}</h3>
            <p className="text-sm leading-6 text-(--text-2)">{route.summary}</p>
          </div>
          <span className="shrink-0 rounded-[var(--radius-pill)] border border-(--border) px-2.5 py-0.5 text-xs font-medium text-(--text-2)">
            {ROUTE_TYPE_LABELS[route.type]}
          </span>
        </div>

        <div className="space-y-1.5">
          <ScaleBar
            label="Cost"
            value={route.cost?.max ?? null}
            max={scale.cost}
            display={formatCost(route.cost)}
          />
          <ScaleBar
            label="Time"
            value={route.timeline?.maxMonths ?? null}
            max={scale.timeline}
            display={formatTimeline(route.timeline)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <SignalPills route={route} />
          <span className="flex items-center gap-1 text-xs font-medium text-(--brand)">
            Details
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </div>

        <QualityBadges labels={deriveQualityLabels(route)} />
      </Link>
    </li>
  );
}

/**
 * The Routes section body: every long-term route for this citizenship ×
 * destination, compared on shared cost/timeline scales and tone-coded signals,
 * re-orderable in place. Selecting a route opens its detail in the peek drawer
 * (the list stays mounted underneath). Client-side because the sort is instant
 * local state over data that's already loaded.
 */
export function RoutesComparison({
  routes,
  basePath,
}: {
  routes: RouteSummary[];
  basePath: string;
}) {
  const [sort, setSort] = useState<RouteSort>("category");

  // Shared magnitude scales across the whole set (not the visible slice, which
  // is the same set reordered), so a bar means the same thing in every row.
  const scale = useMemo<Scale>(
    () => ({
      cost: Math.max(0, ...routes.map((r) => r.cost?.max ?? 0)),
      timeline: Math.max(0, ...routes.map((r) => r.timeline?.maxMonths ?? 0)),
    }),
    [routes],
  );

  const sorted = useMemo(() => sortRoutes(routes, sort), [routes, sort]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.06em] text-(--text-3)">
          Sort
        </span>
        {ROUTE_SORTS.map((option) => {
          const active = option.id === sort;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSort(option.id)}
              className={`rounded-[var(--radius-pill)] border px-3 py-1 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand) ${
                active
                  ? "border-(--brand) bg-(--brand-soft) text-(--text)"
                  : "border-(--border) bg-(--surface) text-(--text-2) hover:border-(--brand) hover:text-(--text)"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <ul className="space-y-3">
        {sorted.map((route) => (
          <RouteRow key={route.id} route={route} basePath={basePath} scale={scale} />
        ))}
      </ul>
    </div>
  );
}
