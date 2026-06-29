import type { RouteSource } from "@pathport/contracts";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrowseChrome } from "@/components/browse-chrome";
import { Fact } from "@/components/fact";
import { QualityBadges } from "@/components/quality-badge";
import { getRouteDetail } from "@/lib/api";
import {
  booleanLabel,
  formatCost,
  formatReviewDate,
  formatTimeline,
  pathToPrLabel,
  ROUTE_TYPE_LABELS,
  workPermissionLabel,
} from "@/lib/format";
import { safeBackHref } from "@/lib/navigation";
import { deriveQualityLabels } from "@/lib/quality";
import { panelClass } from "@/lib/styles";

const SOURCE_TYPE_LABELS: Record<RouteSource["type"], string> = {
  official: "Official",
  legal: "Legal",
  community: "Community",
  ai_assisted: "AI-assisted",
  other: "Other",
};

function ListSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-(--muted)">{title}</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-(--foreground)">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default async function RouteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const [{ id }, { from }] = await Promise.all([params, searchParams]);
  const route = await getRouteDetail(id);
  if (!route) {
    notFound();
  }

  const labels = deriveQualityLabels(
    route,
    route.sources.map((source) => source.type),
  );
  const backHref = safeBackHref(from, route.destination.code);
  const { details } = route;

  return (
    <BrowseChrome>
      <article className="space-y-8">
        <Link
          href={backHref ?? "/"}
          className="inline-flex text-sm font-medium text-(--accent) hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)"
        >
          ← {backHref ? `Back to ${route.destination.name} routes` : "Back to citizenships"}
        </Link>

        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-(--muted)">
            <span className="rounded-full border border-(--border) px-2 py-0.5 font-medium">
              {ROUTE_TYPE_LABELS[route.type]}
            </span>
            <span>{route.destination.name}</span>
          </div>
          <h1 className="text-3xl font-semibold text-(--foreground)">{route.title}</h1>
          <p className="max-w-2xl text-(--muted)">{route.summary}</p>
          <QualityBadges labels={labels} />
        </header>

        <dl className={`grid grid-cols-2 gap-5 sm:grid-cols-3 ${panelClass}`}>
          <Fact label="Cost" value={formatCost(route.cost)} />
          <Fact label="Timeline" value={formatTimeline(route.timeline)} />
          <Fact label="Work rights" value={workPermissionLabel(route.workPermission)} />
          <Fact
            label="Family"
            value={booleanLabel(route.familyInclusion, route.familyInclusionNote)}
          />
          <Fact label="Permanent residence" value={pathToPrLabel(route.pathToPermanentResidence)} />
          <Fact label="Renewable" value={booleanLabel(route.renewable, route.renewableNote)} />
        </dl>

        {details.requirementGroups.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-(--muted)">
              Requirements
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {details.requirementGroups.map((group) => (
                <div key={group.title} className={panelClass}>
                  <h3 className="font-medium text-(--foreground)">{group.title}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-(--muted)">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        <ListSection title="Documents" items={details.documentList} />
        <ListSection title="Who may qualify" items={details.eligibilityNotes} />
        <ListSection title="Process steps" items={details.stepNotes} />
        <ListSection title="Caveats" items={details.caveats} />

        {route.sources.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-(--muted)">
              Sources
            </h2>
            <ul className="space-y-2">
              {route.sources.map((source) => {
                const reviewedOn = formatReviewDate(source.lastReviewedAt);
                return (
                  <li key={source.url} className="text-sm">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-(--accent) hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--accent)"
                    >
                      {source.label}
                    </a>
                    <span className="text-(--muted)">
                      {" "}
                      · {SOURCE_TYPE_LABELS[source.type]}
                      {reviewedOn && ` · reviewed ${reviewedOn}`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </article>
    </BrowseChrome>
  );
}
