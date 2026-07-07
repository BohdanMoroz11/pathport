"use client";

import type { Citizenship, DestinationSummary } from "@pathport/contracts";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn, focusRing } from "@/components/ui/cn";
import { formatCost } from "@/lib/format";
import { coordsFor, projectToPercent } from "@/lib/geo";

/**
 * Run-length land mask (18 rows × 36 cols, equirectangular) → a dotted world map.
 * Coarse and stylized on purpose: it orients the pins without a data dependency.
 */
const LAND_ROWS: [string, number][][] = [
  [
    [".", 13],
    ["#", 3],
    [".", 20],
  ],
  [
    [".", 6],
    ["#", 10],
    [".", 3],
    ["#", 2],
    [".", 3],
    ["#", 12],
  ],
  [
    [".", 2],
    ["#", 10],
    [".", 1],
    ["#", 2],
    [".", 3],
    ["#", 18],
  ],
  [
    [".", 5],
    ["#", 8],
    [".", 4],
    ["#", 19],
  ],
  [
    [".", 5],
    ["#", 7],
    [".", 5],
    ["#", 19],
  ],
  [
    [".", 6],
    ["#", 5],
    [".", 6],
    ["#", 16],
    [".", 3],
  ],
  [
    [".", 7],
    ["#", 4],
    [".", 5],
    ["#", 8],
    [".", 1],
    ["#", 6],
    [".", 5],
  ],
  [
    [".", 8],
    ["#", 2],
    [".", 6],
    ["#", 7],
    [".", 2],
    ["#", 5],
    [".", 6],
  ],
  [
    [".", 10],
    ["#", 4],
    [".", 3],
    ["#", 6],
    [".", 4],
    ["#", 5],
    [".", 4],
  ],
  [
    [".", 10],
    ["#", 4],
    [".", 5],
    ["#", 4],
    [".", 5],
    ["#", 4],
    [".", 4],
  ],
  [
    [".", 10],
    ["#", 5],
    [".", 4],
    ["#", 4],
    [".", 13],
  ],
  [
    [".", 11],
    ["#", 3],
    [".", 5],
    ["#", 3],
    [".", 7],
    ["#", 5],
    [".", 2],
  ],
  [
    [".", 10],
    ["#", 3],
    [".", 6],
    ["#", 2],
    [".", 8],
    ["#", 5],
    [".", 2],
  ],
  [
    [".", 10],
    ["#", 2],
    [".", 22],
    ["#", 2],
  ],
  [
    [".", 10],
    ["#", 1],
    [".", 25],
  ],
  [[".", 36]],
  [[".", 36]],
  [[".", 36]],
];

const LAND_DOTS: { cx: number; cy: number }[] = LAND_ROWS.flatMap((segments, row) => {
  const line = segments.map(([ch, n]) => ch.repeat(n)).join("");
  const dots: { cx: number; cy: number }[] = [];
  for (let col = 0; col < line.length; col++) {
    if (line[col] === "#") dots.push({ cx: col * 10 + 5, cy: row * 10 + 5 });
  }
  return dots;
});

/** Percent (0–100) → the 360×180 SVG viewBox, for arcs drawn in map space. */
function toView(percent: { x: number; y: number }) {
  return { x: (percent.x / 100) * 360, y: (percent.y / 100) * 180 };
}

/** A gently-lifted arc between two map points (flight-path look). */
function arcPath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const a = toView(from);
  const b = toView(to);
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const lift = Math.min(60, Math.hypot(b.x - a.x, b.y - a.y) * 0.35);
  return `M ${a.x} ${a.y} Q ${mid.x} ${mid.y - lift} ${b.x} ${b.y}`;
}

type MappedDestination = {
  destination: DestinationSummary;
  percent: { x: number; y: number };
};

export function MapHero({
  citizenship,
  destinations,
}: {
  citizenship: Citizenship;
  destinations: DestinationSummary[];
}) {
  const mapped: MappedDestination[] = destinations.flatMap((destination) => {
    const coords = coordsFor(destination.code);
    return coords ? [{ destination, percent: projectToPercent(coords.lat, coords.lon) }] : [];
  });

  const originCoords = coordsFor(citizenship.code);
  const origin = originCoords ? projectToPercent(originCoords.lat, originCoords.lon) : null;

  const [selectedCode, setSelectedCode] = useState(mapped[0]?.destination.code ?? "");
  const selected =
    mapped.find((m) => m.destination.code === selectedCode)?.destination ?? destinations[0] ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      {/* Map panel */}
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-(--border) bg-gradient-to-b from-(--surface) to-(--surface-2) shadow-[var(--shadow-sm)]">
        <div className="relative aspect-[2/1] w-full">
          <svg
            viewBox="0 0 360 180"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <title>Stylized world map</title>
            {/* Graticule */}
            <g stroke="var(--border)" strokeWidth="0.4" opacity="0.5">
              {[60, 120, 180, 240, 300].map((x) => (
                <line key={`v${x}`} x1={x} y1={0} x2={x} y2={180} />
              ))}
              {[45, 90, 135].map((y) => (
                <line key={`h${y}`} x1={0} y1={y} x2={360} y2={y} />
              ))}
            </g>
            {/* Land dots */}
            <g className="text-(--text-3)" fill="currentColor" opacity="0.35">
              {LAND_DOTS.map((d) => (
                <circle key={`${d.cx}-${d.cy}`} cx={d.cx} cy={d.cy} r="1.7" />
              ))}
            </g>
            {/* Arcs from the active citizenship to each destination */}
            {origin && (
              <g fill="none" strokeLinecap="round">
                {mapped.map((m) => {
                  const active = m.destination.code === selectedCode;
                  return (
                    <path
                      key={m.destination.code}
                      d={arcPath(origin, m.percent)}
                      className={active ? "text-(--brand)" : "text-(--violet)"}
                      stroke="currentColor"
                      strokeWidth={active ? 1.6 : 0.8}
                      opacity={active ? 0.9 : 0.4}
                    />
                  );
                })}
              </g>
            )}
          </svg>

          {/* Origin marker */}
          {origin && (
            <span
              className="pointer-events-none absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-(--radius-pill) border border-(--border) bg-(--surface) px-2 py-0.5 text-xs shadow-[var(--shadow-sm)]"
              style={{ left: `${origin.x}%`, top: `${origin.y}%` }}
            >
              <span aria-hidden="true">{citizenship.flag ?? "🌐"}</span>
              <span className="font-medium text-(--text-2)">You</span>
            </span>
          )}

          {/* Destination pins */}
          {mapped.map((m) => {
            const active = m.destination.code === selectedCode;
            return (
              <Link
                key={m.destination.code}
                href={`/explore/${citizenship.code}/${m.destination.code}`}
                onMouseEnter={() => setSelectedCode(m.destination.code)}
                onFocus={() => setSelectedCode(m.destination.code)}
                aria-label={`${m.destination.name}: ${m.destination.routeCount} routes. Open destination.`}
                className={cn(
                  "absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full",
                  focusRing("brand"),
                )}
                style={{ left: `${m.percent.x}%`, top: `${m.percent.y}%` }}
              >
                <span className="relative grid place-items-center">
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute size-5 animate-ping rounded-full bg-(--brand) opacity-40"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "size-3 rounded-full border-2 border-(--surface) transition-transform",
                      active ? "scale-125 bg-(--brand)" : "bg-(--violet)",
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-(--radius-pill) px-2 py-0.5 text-xs font-medium transition-opacity",
                    active
                      ? "bg-(--brand) text-(color:--on-brand) opacity-100"
                      : "bg-(--surface) text-(--text-2) opacity-0",
                  )}
                >
                  {m.destination.flag} {m.destination.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Detail panel for the selected destination */}
      {selected && (
        <div className="flex flex-col rounded-[var(--radius-lg)] border border-(--border) bg-(--surface) p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="grid size-11 place-items-center rounded-[var(--radius-md)] bg-(--surface-2) text-2xl"
            >
              {selected.flag ?? "🌐"}
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg font-semibold text-(--text)">{selected.name}</p>
              {selected.region && <p className="text-xs text-(--text-2)">{selected.region}</p>}
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3">
            <Stat label="Routes" value={String(selected.routeCount)} />
            <Stat
              label="From"
              value={
                selected.startingCost
                  ? formatCost({
                      min: selected.startingCost.amount,
                      max: selected.startingCost.amount,
                      currency: selected.startingCost.currency,
                    })
                  : "—"
              }
            />
            <Stat
              label="As fast as"
              value={selected.fastestMonths ? `${selected.fastestMonths} mo` : "—"}
            />
            <Stat
              label="Visa-free"
              value={
                selected.arrivalContext?.visaFreeDays != null
                  ? `${selected.arrivalContext.visaFreeDays} days`
                  : "—"
              }
            />
          </dl>

          {selected.routeTypes.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {selected.routeTypes.slice(0, 4).map((type) => (
                <li key={type}>
                  <Badge size="xs">{type.replace(/_/g, " ")}</Badge>
                </li>
              ))}
            </ul>
          )}

          <Link
            href={`/explore/${citizenship.code}/${selected.code}`}
            className={cn(
              "mt-5 inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-(--brand) px-4 text-sm font-medium text-(color:--on-brand) transition hover:brightness-95",
              focusRing("brand"),
            )}
          >
            Explore {selected.name} →
          </Link>
          <p className="mt-2 text-center text-xs text-(--text-2)">
            Hover a pin to preview · click to open
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] bg-(--surface-2) px-3 py-2">
      <dt className="text-xs text-(--text-2)">{label}</dt>
      <dd className="font-display text-sm font-semibold text-(--text)">{value}</dd>
    </div>
  );
}
