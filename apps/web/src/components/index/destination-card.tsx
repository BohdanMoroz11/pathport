import type { DestinationSummary } from "@pathport/contracts";
import Link from "next/link";
import { QualityBadges } from "@/components/quality-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { deriveQualityLabels } from "@/lib/quality";

/**
 * A destination on a citizenship's index: identity, how many routes apply, and
 * the arrival read — enough to compare destinations at a glance before opening
 * the shell. The whole card links into the destination's Overview.
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

        {arrivalContext && (
          <p className="text-sm leading-6 text-(--text-2)">
            {arrivalContext.summary}
            {arrivalContext.visaFreeDays !== null && (
              <span className="mt-1 block text-(--text)">
                Visa-free stay: {arrivalContext.visaFreeDays} days
              </span>
            )}
          </p>
        )}

        <div className="mt-auto">
          <QualityBadges labels={labels} />
        </div>
      </Link>
    </Card>
  );
}
