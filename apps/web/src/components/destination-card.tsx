import type { DestinationSummary } from "@pathport/contracts";
import Link from "next/link";
import { deriveQualityLabels } from "@/lib/quality";
import { linkCardClass } from "@/lib/styles";
import { QualityBadges } from "./quality-badge";

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
    <Link href={`/explore/${citizenshipCode}/${destination.code}`} className={linkCardClass}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-(--foreground)">{destination.name}</h3>
        <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-(--muted)">
          {routeCountLabel}
        </span>
      </div>

      {arrivalContext && (
        <p className="text-sm leading-6 text-(--muted)">
          {arrivalContext.summary}
          {arrivalContext.visaFreeDays !== null && (
            <span className="mt-1 block text-(--foreground)">
              Visa-free stay: {arrivalContext.visaFreeDays} days
            </span>
          )}
        </p>
      )}

      <QualityBadges labels={labels} />
    </Link>
  );
}
