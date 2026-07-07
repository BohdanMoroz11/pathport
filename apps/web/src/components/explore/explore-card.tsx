import type { DestinationSummary } from "@pathport/contracts";
import Link from "next/link";
import { QualityBadges } from "@/components/quality-badge";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, focusRing } from "@/components/ui/cn";
import { formatCost } from "@/lib/format";
import { deriveQualityLabels } from "@/lib/quality";

/**
 * A destination card for the explore browser. Unlike the index card it is not a
 * single link (it carries a Compare toggle), so the title is the link and the
 * toggle is a separate button — no nested interactives.
 */
export function ExploreCard({
  citizenshipCode,
  destination,
  comparing,
  onToggleCompare,
  compareDisabled,
}: {
  citizenshipCode: string;
  destination: DestinationSummary;
  comparing: boolean;
  onToggleCompare: (code: string) => void;
  compareDisabled: boolean;
}) {
  const { arrivalContext } = destination;
  const labels = arrivalContext ? deriveQualityLabels(arrivalContext) : [];
  const fromCost = destination.startingCost
    ? formatCost({
        min: destination.startingCost.amount,
        max: destination.startingCost.amount,
        currency: destination.startingCost.currency,
      })
    : null;

  return (
    <Card className={cn("flex h-full flex-col gap-3", comparing && "border-(--brand)")}>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-(--surface-2) text-2xl"
        >
          {destination.flag ?? "🌐"}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-lg font-semibold text-(--text)">
            <Link
              href={`/explore/${citizenshipCode}/${destination.code}`}
              className={cn(
                "hover:text-(--brand)",
                focusRing("brand"),
                "rounded-[var(--radius-sm)]",
              )}
            >
              {destination.name}
            </Link>
          </h3>
          {destination.region && (
            <p className="truncate text-xs text-(--text-2)">{destination.region}</p>
          )}
        </div>
        <Badge variant="soft" tone="brand" className="shrink-0">
          {destination.routeCount} {destination.routeCount === 1 ? "route" : "routes"}
        </Badge>
      </div>

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
          {destination.routeTypes.map((type) => (
            <li key={type}>
              <Badge size="xs">{type.replace(/_/g, " ")}</Badge>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-1">
        <QualityBadges labels={labels} />
        <label
          className={cn(
            "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[var(--radius-md)] border px-2.5 py-1 text-xs font-medium transition-colors",
            comparing
              ? "border-(--brand) bg-(--brand-soft) text-(--brand)"
              : "border-(--border) text-(--text-2) hover:border-(--brand) hover:text-(--text)",
            compareDisabled && !comparing && "cursor-not-allowed opacity-40",
          )}
        >
          <input
            type="checkbox"
            className="sr-only"
            checked={comparing}
            disabled={compareDisabled && !comparing}
            onChange={() => onToggleCompare(destination.code)}
          />
          <span aria-hidden="true">{comparing ? "✓" : "+"}</span>
          Compare
        </label>
      </div>
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
