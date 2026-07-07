import type { DestinationSummary } from "@pathport/contracts";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BrowseShell } from "@/components/browse-shell";
import { DestinationCard } from "@/components/index/destination-card";
import { Combobox, type ComboboxItem } from "@/components/ui/combobox";
import { getCitizenships, getDestinations } from "@/lib/api";

/** Preserve the API's name order while collecting each region's destinations. */
function groupByRegion(
  destinations: DestinationSummary[],
): { region: string; destinations: DestinationSummary[] }[] {
  const groups: { region: string; destinations: DestinationSummary[] }[] = [];
  for (const destination of destinations) {
    const region = destination.region ?? "Other";
    const group = groups.find((g) => g.region === region);
    if (group) {
      group.destinations.push(destination);
    } else {
      groups.push({ region, destinations: [destination] });
    }
  }
  return groups;
}

function toComboboxItem(citizenshipCode: string, destination: DestinationSummary): ComboboxItem {
  return {
    value: destination.code,
    label: destination.name,
    href: `/explore/${citizenshipCode}/${destination.code}`,
    glyph: destination.flag,
    hint: destination.code,
  };
}

export default async function DestinationsPage({
  params,
}: {
  params: Promise<{ citizenship: string }>;
}) {
  const { citizenship } = await params;
  const [citizenships, destinations] = await Promise.all([
    getCitizenships(),
    getDestinations(citizenship),
  ]);

  const current = citizenships.find((c) => c.code.toLowerCase() === citizenship.toLowerCase());
  if (!current || !destinations) {
    notFound();
  }

  const groups = groupByRegion(destinations);

  return (
    <BrowseShell>
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Citizenships", href: "/" }, { label: current.name }]} />

        <header className="space-y-2">
          <h1 className="flex items-center gap-3 font-display text-3xl font-semibold text-(--text)">
            {current.flag && <span aria-hidden="true">{current.flag}</span>}
            Destinations for {current.name}
          </h1>
          <p className="text-(--text-2)">
            Countries with at least one immigration route open to {current.name} citizens. Pick one
            to compare its routes.
          </p>
        </header>

        {destinations.length === 0 ? (
          <p className="text-(--text-2)">No destinations are available yet for this citizenship.</p>
        ) : (
          <div className="space-y-8">
            <Combobox
              items={destinations.map((d) => toComboboxItem(current.code, d))}
              label="Jump to a destination"
              hideLabel
              placeholder="Search destinations…"
              emptyMessage="No matching destination."
              className="max-w-md"
            />

            {groups.map((group) => (
              <section key={group.region} className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-(--text-2)">
                  {group.region}
                </h2>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {group.destinations.map((destination) => (
                    <li key={destination.code}>
                      <DestinationCard citizenshipCode={current.code} destination={destination} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </BrowseShell>
  );
}
