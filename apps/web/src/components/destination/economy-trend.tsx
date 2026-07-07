"use client";

import type { TrendSeries } from "@pathport/contracts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";

/** Display-ready value with the series' prefix/suffix, e.g. "$4.53T", "6%". */
function formatValue(series: TrendSeries, value: number): string {
  return `${series.prefix ?? ""}${value.toLocaleString("en-US")}${series.unit ?? ""}`;
}

/**
 * The economy trend chart: a set of switchable time-series metrics (GDP, pay,
 * unemployment, inflation) plotted one at a time as a single-hue line — per the
 * data-viz guidance one measure means one axis, so switching metric re-scales to
 * that series rather than crowding several units onto shared axes. The hovered
 * or focused point drives a direct-labelled headline value, every point is a
 * keyboard-reachable hit target, and a screen-reader table mirrors the data.
 */
export function EconomyTrend({ series }: { series: TrendSeries[] }) {
  const [activeId, setActiveId] = useState(series[0]?.id);
  const [hover, setHover] = useState<number | null>(null);
  const active = series.find((s) => s.id === activeId) ?? series[0];
  const first = active?.points.at(0);
  const last = active?.points.at(-1);
  if (!active || !first || !last) {
    return null;
  }

  const values = active.points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || Math.abs(max) || 1;
  const n = active.points.length;

  const px = (i: number) => (n <= 1 ? 50 : (i / (n - 1)) * 100);
  const py = (v: number) => 100 - ((v - min) / range) * 100;

  const line = active.points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${px(i)},${py(p.value)}`)
    .join(" ");
  const area = `${line} L ${px(n - 1)},100 L ${px(0)},100 Z`;

  const lastIndex = n - 1;
  const shownIndex = hover ?? lastIndex;
  const shown = active.points[shownIndex] ?? last;

  const round = (v: number) => (max >= 100 ? Math.round(v) : Math.round(v * 10) / 10);
  const gridValues = [max, (max + min) / 2, min];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-[0.06em] text-(--text-3)">
          Metric
        </span>
        {series.map((s) => {
          const on = s.id === active.id;
          return (
            <Button
              key={s.id}
              variant="secondary"
              size="sm"
              aria-pressed={on}
              onClick={() => {
                setActiveId(s.id);
                setHover(null);
              }}
              className={cn(
                "rounded-[var(--radius-pill)]",
                on && "border-(--brand) bg-(--brand-soft) text-(--text)",
              )}
            >
              {s.label}
            </Button>
          );
        })}
      </div>

      <Card>
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <div>
            <p className="font-display text-2xl font-semibold text-(--text) tabular-nums">
              {formatValue(active, shown.value)}
            </p>
            <p className="text-xs text-(--text-3)">
              {active.label} · {shown.year}
            </p>
          </div>
          <p className="text-right text-xs text-(--text-3)">
            {first.year}–{last.year}
          </p>
        </div>

        <div className="relative h-48">
          <div className="absolute inset-0 flex flex-col justify-between">
            {gridValues.map((v, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed 3-row axis scale
                key={i}
                className="flex items-center gap-2"
              >
                <span className="w-14 shrink-0 text-right text-[10px] tabular-nums text-(--text-3)">
                  {formatValue(active, round(v))}
                </span>
                <span className="h-px flex-1 bg-(--border)" />
              </div>
            ))}
          </div>

          <div className="absolute inset-y-0 right-0 left-16">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 size-full overflow-visible"
              aria-hidden="true"
            >
              <title>{active.label} trend</title>
              <path d={area} fill="var(--brand)" opacity="0.08" />
              <path
                d={line}
                fill="none"
                stroke="var(--brand)"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            {active.points.map((p, i) => {
              const on = i === shownIndex;
              return (
                <button
                  key={p.year}
                  type="button"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  aria-label={`${p.year}: ${formatValue(active, p.value)}`}
                  className="absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand)"
                  style={{ left: `${px(i)}%`, top: `${py(p.value)}%` }}
                >
                  <span
                    className={`rounded-full border-2 border-(--surface) bg-(--brand) transition-all ${
                      on ? "size-3" : "size-2"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-2 ml-16 flex justify-between text-[10px] tabular-nums text-(--text-3)">
          {active.points.map((p) => (
            <span key={p.year}>{p.year}</span>
          ))}
        </div>
      </Card>

      <p className="max-w-2xl text-sm leading-6 text-(--text-2)">{active.note}</p>

      <table className="sr-only">
        <caption>
          {active.label} by year, {first.year}–{last.year}
        </caption>
        <thead>
          <tr>
            <th>Year</th>
            <th>{active.label}</th>
          </tr>
        </thead>
        <tbody>
          {active.points.map((p) => (
            <tr key={p.year}>
              <td>{p.year}</td>
              <td>{formatValue(active, p.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
