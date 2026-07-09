"use client";

import type { Citizenship, DestinationSummary } from "@pathport/contracts";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Marker,
  Sphere,
} from "react-simple-maps";
import worldTopo from "world-atlas/countries-110m.json";
import { cn, focusRing } from "@/components/ui/cn";
import { formatCost } from "@/lib/format";
import { coordsFor, numericIdFor } from "@/lib/geo";

// The vendored world-atlas topojson, loosely typed for the `geography` prop.
const GEOGRAPHY = worldTopo as object;

// Fills expressed with color-mix so they track the brand token across themes.
const FILL_UNREACHABLE = "rgba(255,255,255,0.05)";
const FILL_REACHABLE = "color-mix(in srgb, var(--brand) 34%, transparent)";
const FILL_HOVER = "color-mix(in srgb, var(--brand) 62%, transparent)";
const FILL_ACTIVE = "color-mix(in srgb, var(--brand) 88%, transparent)";
const STROKE_LAND = "rgba(255,255,255,0.14)";
const STROKE_REACHABLE = "color-mix(in srgb, var(--brand) 55%, transparent)";

export function MapHero({
  citizenship,
  destinations,
}: {
  citizenship: Citizenship;
  destinations: DestinationSummary[];
}) {
  // Only destinations we can place on the real map (have a known ISO id).
  const reachable = useMemo(
    () => destinations.filter((d) => numericIdFor(d.code) !== null),
    [destinations],
  );

  // Numeric ISO id → destination, for lighting up the matching country path.
  const byId = useMemo(() => {
    const map = new Map<string, DestinationSummary>();
    for (const d of reachable) {
      const id = numericIdFor(d.code);
      if (id) map.set(id, d);
    }
    return map;
  }, [reachable]);

  const origin = coordsFor(citizenship.code);

  const [selectedCode, setSelectedCode] = useState(reachable[0]?.code);
  const [hoverCode, setHoverCode] = useState<string | null>(null);

  // react-simple-maps renders differently on the server than after its client
  // effects run, so render the map only once mounted (a same-size placeholder
  // holds the space) to keep SSR and hydration in agreement.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Hover previews; click/selection persists.
  const activeCode = hoverCode ?? selectedCode;
  const active = reachable.find((d) => d.code === activeCode) ?? reachable[0] ?? null;
  const activeCoords = active ? coordsFor(active.code) : null;

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-white/10 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(255,255,255,0.05),transparent_60%)] shadow-[0_50px_120px_-60px_rgba(0,0,0,0.95)] [&_svg]:block [&_svg]:h-auto [&_svg]:w-full">
        {!mounted && <div className="aspect-[3/2] w-full" aria-hidden="true" />}
        {mounted && (
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{ scale: 215, center: [10, 8] }}
            width={900}
            height={600}
          >
            <Sphere
              id="ocean"
              fill="rgba(255,255,255,0.015)"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={0.5}
            />
            <Graticule stroke="rgba(255,255,255,0.05)" strokeWidth={0.4} />

            <Geographies geography={GEOGRAPHY}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const id = String(geo.id);
                  const dest = byId.get(id);
                  const isReachable = dest !== undefined;
                  const isActive = isReachable && dest.code === active?.code;
                  const fill = isActive
                    ? FILL_ACTIVE
                    : isReachable
                      ? FILL_REACHABLE
                      : FILL_UNREACHABLE;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={dest ? () => setHoverCode(dest.code) : undefined}
                      onMouseLeave={dest ? () => setHoverCode(null) : undefined}
                      onClick={dest ? () => setSelectedCode(dest.code) : undefined}
                      style={{
                        default: {
                          fill,
                          stroke: isReachable ? STROKE_REACHABLE : STROKE_LAND,
                          strokeWidth: isActive ? 0.9 : 0.5,
                          outline: "none",
                          cursor: isReachable ? "pointer" : "default",
                          transition: "fill 180ms ease",
                        },
                        hover: {
                          fill: isActive
                            ? FILL_ACTIVE
                            : isReachable
                              ? FILL_HOVER
                              : FILL_UNREACHABLE,
                          stroke: isReachable ? STROKE_REACHABLE : STROKE_LAND,
                          strokeWidth: isReachable ? 0.9 : 0.5,
                          outline: "none",
                          cursor: isReachable ? "pointer" : "default",
                        },
                        pressed: { fill: FILL_ACTIVE, outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* Passport origin */}
            {origin && (
              <Marker coordinates={[origin.lon, origin.lat]} className="pointer-events-none">
                <circle r={4.5} fill="var(--brand)" opacity={0.25} />
                <circle r={2.4} fill="#ffffff" stroke="var(--brand)" strokeWidth={1.2} />
                <text
                  textAnchor="middle"
                  y={-8}
                  style={{ fill: "#ffffff", fontSize: 10, fontWeight: 600, opacity: 0.75 }}
                >
                  You
                </text>
              </Marker>
            )}

            {/* Selected destination pulse */}
            {active && activeCoords && (
              <Marker
                coordinates={[activeCoords.lon, activeCoords.lat]}
                className="pointer-events-none"
              >
                <circle r={6} fill="var(--brand)" opacity={0.2} />
                <circle r={2.6} fill="var(--brand)" stroke="#ffffff" strokeWidth={1.2} />
              </Marker>
            )}
          </ComposableMap>
        )}

        {active && (
          <DetailCard
            citizenshipCode={citizenship.code}
            destination={active}
            total={reachable.length}
          />
        )}
      </div>
    </div>
  );
}

function DetailCard({
  citizenshipCode,
  destination,
  total,
}: {
  citizenshipCode: string;
  destination: DestinationSummary;
  total: number;
}) {
  const fromCost = destination.startingCost
    ? formatCost({
        min: destination.startingCost.amount,
        max: destination.startingCost.amount,
        currency: destination.startingCost.currency,
      })
    : null;

  return (
    <div className="border-white/10 border-t bg-black/40 p-4 backdrop-blur-md lg:absolute lg:bottom-4 lg:left-4 lg:max-w-[19rem] lg:rounded-[var(--radius-lg)] lg:border">
      <p className="text-[0.7rem] text-(--rail-text-2) uppercase tracking-wide">
        {total} destinations open to you
      </p>
      <div className="mt-1 flex items-center gap-2">
        {destination.flag && (
          <span aria-hidden="true" className="text-xl">
            {destination.flag}
          </span>
        )}
        <p className="font-display font-semibold text-(--rail-text) text-lg">{destination.name}</p>
      </div>

      <dl className="mt-3 flex gap-4">
        <Stat label="Routes" value={String(destination.routeCount)} />
        <Stat label="From" value={fromCost ?? "—"} />
        <Stat
          label="As fast as"
          value={destination.fastestMonths ? `${destination.fastestMonths} mo` : "—"}
        />
      </dl>

      <Link
        href={`/explore/${citizenshipCode}/${destination.code}`}
        className={cn(
          "mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-[image:var(--gradient-brand)] px-4 font-semibold text-(color:--on-brand) text-sm transition hover:brightness-105",
          focusRing("brand"),
        )}
      >
        Explore {destination.name} →
      </Link>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.7rem] text-(--rail-text-2)">{label}</dt>
      <dd className="font-display font-semibold text-(--rail-text) text-sm">{value}</dd>
    </div>
  );
}
