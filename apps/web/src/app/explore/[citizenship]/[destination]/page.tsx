import type { RouteSummary, RouteType } from "@pathport/contracts";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { RouteCard } from "@/components/route-card";
import { getCitizenships, getDestinations, getRoutes } from "@/lib/api";
import { ROUTE_TYPE_LABELS, ROUTE_TYPE_ORDER } from "@/lib/format";

/** Group routes by type, preserving the domain taxonomy order. */
function groupByType(routes: RouteSummary[]): { type: RouteType; routes: RouteSummary[] }[] {
  return ROUTE_TYPE_ORDER.map((type) => ({
    type,
    routes: routes.filter((route) => route.type === type),
  })).filter((group) => group.routes.length > 0);
}

export default async function RoutesPage({
  params,
}: {
  params: Promise<{ citizenship: string; destination: string }>;
}) {
  const { citizenship, destination } = await params;
  const [citizenships, destinations, routes] = await Promise.all([
    getCitizenships(),
    getDestinations(citizenship),
    getRoutes(citizenship, destination),
  ]);

  const current = citizenships.find((c) => c.code.toLowerCase() === citizenship.toLowerCase());
  const dest = destinations?.find((d) => d.code.toLowerCase() === destination.toLowerCase());
  if (!current || !dest || !routes) {
    notFound();
  }

  const groups = groupByType(routes);
  const backToDestination = `/explore/${current.code}/${dest.code}`;

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Citizenships", href: "/" },
          { label: current.name, href: `/explore/${current.code}` },
          { label: dest.name },
        ]}
      />

      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">
          {dest.name} routes for {current.name}
        </h1>
        {dest.arrivalContext && (
          <p className="text-[var(--muted)]">{dest.arrivalContext.summary}</p>
        )}
      </header>

      {groups.length === 0 ? (
        <p className="text-[var(--muted)]">No routes are available yet for this pairing.</p>
      ) : (
        groups.map((group) => (
          <section key={group.type} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
              {ROUTE_TYPE_LABELS[group.type]}
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {group.routes.map((route) => (
                <li key={route.id}>
                  <RouteCard
                    route={route}
                    href={`/routes/${route.id}?from=${encodeURIComponent(backToDestination)}`}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
