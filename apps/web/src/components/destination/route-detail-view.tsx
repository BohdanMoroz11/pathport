import type { CountryStat, RouteDetail, RouteSource } from "@pathport/contracts";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  booleanLabel,
  formatCost,
  formatReviewDate,
  formatTimeline,
  ROUTE_TYPE_LABELS,
} from "@/lib/format";
import { deriveQualityLabels } from "@/lib/quality";
import { COMPLEXITY_META, PR_SHORT, PR_TONE, WORK_SHORT, WORK_TONE } from "@/lib/route-view";
import { QualityBadges } from "../quality-badge";
import { Caption, StatGrid, Steps } from "./section-kit";

const SOURCE_TYPE_LABELS: Record<RouteSource["type"], string> = {
  official: "Official",
  legal: "Legal",
  community: "Community",
  ai_assisted: "AI-assisted",
  other: "Other",
};

/** The comparable columns as a tone-coded fact grid — shared with the list. */
function routeFacts(route: RouteDetail): CountryStat[] {
  return [
    { label: "Cost", value: formatCost(route.cost) },
    { label: "Timeline", value: formatTimeline(route.timeline) },
    {
      label: "Complexity",
      value: COMPLEXITY_META[route.complexity].label,
      tone: COMPLEXITY_META[route.complexity].tone,
    },
    {
      label: "Work rights",
      value: WORK_SHORT[route.workPermission],
      tone: WORK_TONE[route.workPermission],
    },
    {
      label: "Permanent residence",
      value: PR_SHORT[route.pathToPermanentResidence],
      tone: PR_TONE[route.pathToPermanentResidence],
      note: route.pathToPermanentResidenceNote ?? undefined,
    },
    {
      label: "Family",
      value: route.familyInclusion ? "Can join" : "Not included",
      tone: route.familyInclusion ? "pos" : "neutral",
      note: route.familyInclusionNote ?? undefined,
    },
    {
      label: "Renewable",
      value: booleanLabel(route.renewable, null),
      tone: route.renewable ? "pos" : "neutral",
      note: route.renewableNote ?? undefined,
    },
  ];
}

/** A titled list block, rendered only when it has items. */
function DetailList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }
  return (
    <section className="space-y-2">
      <Caption>{title}</Caption>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-(--text-2)">
            <span aria-hidden="true" className="text-(--text-3)">
              •
            </span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * The full body of one route, in the destination-shell token system. Rendered
 * both inside the peek Drawer and on the standalone detail page, so a shared or
 * refreshed URL shows exactly what the drawer does. The surrounding chrome (the
 * sheet, or the page column + back link) is the caller's job.
 */
export function RouteDetailView({ route }: { route: RouteDetail }) {
  const labels = deriveQualityLabels(
    route,
    route.sources.map((source) => source.type),
  );
  const { details } = route;

  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <Badge>{ROUTE_TYPE_LABELS[route.type]}</Badge>
        <h2 className="font-display text-2xl font-semibold text-(--text)">{route.title}</h2>
        <p className="max-w-2xl text-[0.95rem] leading-7 text-(--text-2)">{route.summary}</p>
        <QualityBadges labels={labels} />
      </header>

      <StatGrid stats={routeFacts(route)} />

      {route.keyRisks.length > 0 && (
        <section className="space-y-2 rounded-[var(--radius-lg)] border border-(--warn) border-l-[3px] bg-(--warn-soft) p-4">
          <Caption>Potential problems</Caption>
          <ul className="space-y-1.5">
            {route.keyRisks.map((risk) => (
              <li key={risk} className="flex gap-2 text-sm leading-6 text-(--text-2)">
                <span aria-hidden="true" className="text-(--warn)">
                  !
                </span>
                {risk}
              </li>
            ))}
          </ul>
        </section>
      )}

      {details.permitWalkthrough.length > 0 && (
        <section className="space-y-3">
          <Caption>How to get this permit</Caption>
          <Steps steps={details.permitWalkthrough} />
        </section>
      )}

      {details.requirementGroups.length > 0 && (
        <section className="space-y-3">
          <Caption>Requirements</Caption>
          <div className="grid gap-3 sm:grid-cols-2">
            {details.requirementGroups.map((group) => (
              <Card key={group.title} padding="md">
                <p className="text-sm font-medium text-(--text)">{group.title}</p>
                <ul className="mt-2 space-y-1.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-6 text-(--text-2)">
                      <span aria-hidden="true" className="text-(--text-3)">
                        •
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>
      )}

      <DetailList title="Documents" items={details.documentList} />
      <DetailList title="Who may qualify" items={details.eligibilityNotes} />
      <DetailList title="Process steps" items={details.stepNotes} />
      <DetailList title="Caveats" items={details.caveats} />

      {route.sources.length > 0 && (
        <section className="space-y-3">
          <Caption>Sources</Caption>
          <ul className="space-y-2">
            {route.sources.map((source) => {
              const reviewedOn = formatReviewDate(source.lastReviewedAt);
              return (
                <li key={source.url} className="text-sm">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-(--brand) hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand)"
                  >
                    {source.label}
                  </a>
                  <span className="text-(--text-3)">
                    {" · "}
                    {SOURCE_TYPE_LABELS[source.type]}
                    {reviewedOn && ` · reviewed ${reviewedOn}`}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}
