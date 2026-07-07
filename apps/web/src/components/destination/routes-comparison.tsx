"use client";

import type { RouteSummary } from "@pathport/contracts";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { TONE_BG } from "@/components/ui/tone";
import { formatCost, formatTimeline, ROUTE_TYPE_LABELS } from "@/lib/format";
import { deriveQualityLabels } from "@/lib/quality";
import {
  COMPLEXITY_META,
  ROUTE_SORTS,
  type RouteSort,
  routeSignals,
  sortRoutes,
} from "@/lib/route-view";
import { QualityBadges } from "../quality-badge";

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
    <div className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 text-sm">
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

/** The headline "how involved is this" signal — a filled, tone-coded pill. */
function ComplexityBadge({ route }: { route: RouteSummary }) {
  const meta = COMPLEXITY_META[route.complexity];
  return (
    <Badge tone={meta.tone} dot>
      {meta.label} complexity
    </Badge>
  );
}

/** The tone-coded ordinal signals (work rights, PR, family, renewable). */
function SignalPills({ route }: { route: RouteSummary }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {routeSignals(route).map((signal) => (
        <li key={signal.label}>
          <Badge>
            <span
              aria-hidden="true"
              className={cn("size-1.5 rounded-full", TONE_BG[signal.tone])}
            />
            {signal.value}
          </Badge>
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
    <li className="flex">
      <Card asChild interactive className="group flex h-full w-full flex-col gap-4">
        <Link href={`${basePath}/routes/${route.id}`} scroll={false}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 font-display text-base font-semibold text-(--text)">
              {route.title}
            </h3>
            <Badge className="shrink-0">{ROUTE_TYPE_LABELS[route.type]}</Badge>
          </div>

          <ComplexityBadge route={route} />

          <p className="text-sm leading-6 text-(--text-2)">{route.summary}</p>

          {route.stepsOverview && (
            <div className="rounded-[var(--radius-md)] border border-(--border) bg-(--bg) p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-(--text-3)">
                How it works
              </p>
              <p className="mt-1 text-sm leading-6 text-(--text-2)">{route.stepsOverview}</p>
            </div>
          )}

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

          <SignalPills route={route} />

          {route.keyRisks.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-(--warn)">
                Watch out for
              </p>
              <ul className="space-y-1">
                {route.keyRisks.map((risk) => (
                  <li key={risk} className="flex gap-2 text-xs leading-5 text-(--text-2)">
                    <span aria-hidden="true" className="text-(--warn)">
                      !
                    </span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 pt-1">
            <QualityBadges labels={deriveQualityLabels(route)} />
            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-(--brand)">
              Details
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </div>
        </Link>
      </Card>
    </li>
  );
}

/**
 * The Routes section body: every long-term route for this citizenship ×
 * destination, compared on shared cost/timeline scales and tone-coded signals,
 * re-orderable in place. Cards sit side by side on wide viewports. Selecting a
 * route opens its detail in the peek drawer (the list stays mounted underneath).
 * Client-side because the sort is instant local state over already-loaded data.
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
            <Button
              key={option.id}
              variant="secondary"
              size="sm"
              aria-pressed={active}
              onClick={() => setSort(option.id)}
              className={cn(
                "rounded-[var(--radius-pill)]",
                active && "border-(--brand) bg-(--brand-soft) text-(--text)",
              )}
            >
              {option.label}
            </Button>
          );
        })}
      </div>

      <ul className="grid gap-3 lg:grid-cols-2">
        {sorted.map((route) => (
          <RouteRow key={route.id} route={route} basePath={basePath} scale={scale} />
        ))}
      </ul>
    </div>
  );
}
