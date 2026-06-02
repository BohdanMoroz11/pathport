import type { RouteSummary } from "@pathport/contracts";
import Link from "next/link";
import { formatCost, formatTimeline, ROUTE_TYPE_LABELS, workPermissionLabel } from "@/lib/format";
import { deriveQualityLabels } from "@/lib/quality";
import { linkCardClass } from "@/lib/styles";
import { Fact } from "./fact";
import { QualityBadges } from "./quality-badge";

export function RouteCard({ route, href }: { route: RouteSummary; href: string }) {
  const labels = deriveQualityLabels(route);

  return (
    <Link href={href} className={linkCardClass}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-[var(--foreground)]">{route.title}</h3>
        <span className="shrink-0 rounded-full border border-[var(--border)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
          {ROUTE_TYPE_LABELS[route.type]}
        </span>
      </div>

      <p className="text-sm leading-6 text-[var(--muted)]">{route.summary}</p>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Fact label="Cost" value={formatCost(route.cost)} />
        <Fact label="Timeline" value={formatTimeline(route.timeline)} />
        <Fact label="Work rights" value={workPermissionLabel(route.workPermission)} />
      </dl>

      <QualityBadges labels={labels} />
    </Link>
  );
}
