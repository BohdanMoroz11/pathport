"use client";

import type { DestinationSummary, RouteType } from "@pathport/contracts";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn, focusRing } from "@/components/ui/cn";
import { CompareDialog } from "./compare-dialog";
import { ExploreCard } from "./explore-card";

const MAX_COMPARE = 3;

type Sort = "routes" | "name" | "cheapest" | "fastest";
const SORTS: { value: Sort; label: string }[] = [
  { value: "routes", label: "Most routes" },
  { value: "name", label: "Name A–Z" },
  { value: "cheapest", label: "Cheapest first" },
  { value: "fastest", label: "Fastest first" },
];

const selectClass = cn(
  "h-9 rounded-[var(--radius-md)] border border-(--border) bg-(--surface) px-2.5 text-sm text-(--text)",
  focusRing("brand"),
);

export function DestinationExplorer({
  citizenshipCode,
  destinations,
}: {
  citizenshipCode: string;
  destinations: DestinationSummary[];
}) {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [routeType, setRouteType] = useState<"all" | RouteType>("all");
  const [sort, setSort] = useState<Sort>("routes");
  const [compareCodes, setCompareCodes] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const regions = useMemo(
    () => [...new Set(destinations.map((d) => d.region).filter((r): r is string => !!r))].sort(),
    [destinations],
  );
  const routeTypes = useMemo(
    () => [...new Set(destinations.flatMap((d) => d.routeTypes))].sort(),
    [destinations],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = destinations.filter((d) => {
      if (q && !d.name.toLowerCase().includes(q)) return false;
      if (region !== "all" && d.region !== region) return false;
      if (routeType !== "all" && !d.routeTypes.includes(routeType)) return false;
      return true;
    });
    const by: Record<Sort, (a: DestinationSummary, b: DestinationSummary) => number> = {
      routes: (a, b) => b.routeCount - a.routeCount || a.name.localeCompare(b.name),
      name: (a, b) => a.name.localeCompare(b.name),
      cheapest: (a, b) =>
        (a.startingCost?.amount ?? Number.POSITIVE_INFINITY) -
        (b.startingCost?.amount ?? Number.POSITIVE_INFINITY),
      fastest: (a, b) =>
        (a.fastestMonths ?? Number.POSITIVE_INFINITY) -
        (b.fastestMonths ?? Number.POSITIVE_INFINITY),
    };
    return [...filtered].sort(by[sort]);
  }, [destinations, query, region, routeType, sort]);

  const compareList = compareCodes
    .map((code) => destinations.find((d) => d.code === code))
    .filter((d): d is DestinationSummary => !!d);

  function toggleCompare(code: string) {
    setCompareCodes((current) =>
      current.includes(code)
        ? current.filter((c) => c !== code)
        : current.length < MAX_COMPARE
          ? [...current, code]
          : current,
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-[var(--radius-lg)] border border-(--border) bg-(--surface) p-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search destinations…"
          aria-label="Search destinations"
          className={cn(
            "h-9 min-w-40 flex-1 rounded-[var(--radius-md)] border border-(--border) bg-(--surface) px-3 text-sm text-(--text) placeholder:text-(--text-3)",
            focusRing("brand"),
          )}
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          aria-label="Filter by region"
          className={selectClass}
        >
          <option value="all">All regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={routeType}
          onChange={(e) => setRouteType(e.target.value as "all" | RouteType)}
          aria-label="Filter by route type"
          className={selectClass}
        >
          <option value="all">All route types</option>
          {routeTypes.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          aria-label="Sort destinations"
          className={selectClass}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-3 text-sm text-(--text-2)" aria-live="polite">
        {results.length} {results.length === 1 ? "destination" : "destinations"}
      </p>

      {results.length === 0 ? (
        <p className="mt-6 text-(--text-2)">No destinations match these filters.</p>
      ) : (
        <ul className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((destination) => (
            <li key={destination.code}>
              <ExploreCard
                citizenshipCode={citizenshipCode}
                destination={destination}
                comparing={compareCodes.includes(destination.code)}
                onToggleCompare={toggleCompare}
                compareDisabled={compareCodes.length >= MAX_COMPARE}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Compare tray */}
      {compareList.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-(--border) bg-(--surface)/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[90rem] flex-wrap items-center gap-3 px-6 py-3 lg:px-10">
            <span className="text-sm font-medium text-(--text-2)">
              Comparing {compareList.length} of {MAX_COMPARE}
            </span>
            <ul className="flex flex-wrap items-center gap-1.5">
              {compareList.map((d) => (
                <li key={d.code}>
                  <button
                    type="button"
                    onClick={() => toggleCompare(d.code)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-(--radius-pill) border border-(--border) bg-(--surface-2) py-1 pl-2 pr-1.5 text-sm text-(--text)",
                      focusRing("brand"),
                    )}
                  >
                    <span aria-hidden="true">{d.flag}</span>
                    {d.name}
                    <span aria-hidden="true" className="text-(--text-3)">
                      ✕
                    </span>
                    <span className="sr-only">Remove {d.name} from comparison</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCompareCodes([])}>
                Clear
              </Button>
              <Button
                size="sm"
                disabled={compareList.length < 2}
                onClick={() => setCompareOpen(true)}
              >
                Compare →
              </Button>
            </div>
          </div>
        </div>
      )}

      <CompareDialog
        citizenshipCode={citizenshipCode}
        destinations={compareList}
        open={compareOpen}
        onOpenChange={setCompareOpen}
      />
    </div>
  );
}
