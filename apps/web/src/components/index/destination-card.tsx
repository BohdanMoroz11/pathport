import type { DestinationSummary } from "@pathport/contracts";
import Link from "next/link";
import { QualityBadges } from "@/components/quality-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCost } from "@/lib/format";
import { deriveQualityLabels } from "@/lib/quality";

/**
 * A destination on a citizenship's index: identity, how many routes apply, the
 * comparison metrics (cheapest / fastest route, route types), and the arrival
 * read — enough to compare destinations at a glance before opening the shell.
 * The whole card links into the destination's Overview.
 */
export function DestinationCard({
  citizenshipCode,
  destination,
}: {
  citizenshipCode: string;
  destination: DestinationSummary;
}) {
  const { arrivalContext } = destination;
  const labels = arrivalContext ? deriveQualityLabels(arrivalContext) : [];
  const routeCountLabel = `${destination.routeCount} ${
    destination.routeCount === 1 ? "route" : "routes"
  }`;
  const fromCost = destination.startingCost
    ? formatCost({
        min: destination.startingCost.amount,
        max: destination.startingCost.amount,
        currency: destination.startingCost.currency,
      })
    : null;

  return (
    <Card asChild interactive className="group h-full">
      <Link
        href={`/explore/${citizenshipCode}/${destination.code}`}
        className="flex h-full flex-col gap-3"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-(--surface-2) text-2xl"
          >
            {destination.flag ?? "🌐"}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-lg font-semibold text-(--text)">
              {destination.name}
            </h3>
            {destination.region && (
              <p className="truncate text-xs text-(--text-2)">{destination.region}</p>
            )}
          </div>
          <Badge variant="soft" tone="brand" className="shrink-0">
            {routeCountLabel}
          </Badge>
        </div>

        {/* Comparison metrics */}
        <dl className="grid grid-cols-3 gap-2 border-y border-(--border) py-2.5 text-center">
          <Metric label="From" value={fromCost ?? "—"} />
          <Metric
            label="As fast as"
            value={destination.fastestMonths ? `${destination.fastestMonths} mo` : "—"}
          />
          <Metric
            label="Visa-free"
            value={arrivalContext?.visaFreeDays != null ? `${arrivalContext.visaFreeDays}d` : "—"}
          />
        </dl>

        {destination.routeTypes.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {destination.routeTypes.slice(0, 3).map((type) => (
              <li key={type}>
                <Badge size="xs">{type.replace(/_/g, " ")}</Badge>
              </li>
            ))}
            {destination.routeTypes.length > 3 && (
              <li>
                <Badge size="xs">+{destination.routeTypes.length - 3}</Badge>
              </li>
            )}
          </ul>
        )}

        {arrivalContext && (
          <p className="line-clamp-2 text-sm leading-6 text-(--text-2)">{arrivalContext.summary}</p>
        )}

        <div className="mt-auto">
          <QualityBadges labels={labels} />
        </div>
      </Link>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.65rem] uppercase tracking-wide text-(--text-2)">{label}</dt>
      <dd className="font-display text-sm font-semibold text-(--text)">{value}</dd>
    </div>
  );
}
