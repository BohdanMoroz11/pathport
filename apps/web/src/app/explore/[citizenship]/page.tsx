import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BrowseChrome } from "@/components/browse-chrome";
import { DestinationCard } from "@/components/destination-card";
import { getCitizenships, getDestinations } from "@/lib/api";

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

  return (
    <BrowseChrome>
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Citizenships", href: "/" }, { label: current.name }]} />

        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-(--foreground)">
            Destinations for {current.name}
          </h1>
          <p className="text-(--muted)">
            Countries with at least one immigration route open to {current.name} citizens. Pick one
            to compare its routes.
          </p>
        </header>

        {destinations.length === 0 ? (
          <p className="text-(--muted)">No destinations are available yet for this citizenship.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {destinations.map((destination) => (
              <li key={destination.code}>
                <DestinationCard citizenshipCode={current.code} destination={destination} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </BrowseChrome>
  );
}
