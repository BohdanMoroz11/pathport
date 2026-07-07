import { BrowseShell } from "@/components/browse-shell";
import { CitizenshipSelector } from "@/components/citizenship-selector";
import { MapHero } from "@/components/home/map-hero";
import { DestinationCard } from "@/components/index/destination-card";
import { getCitizenships, getDestinations } from "@/lib/api";
import { resolveActiveCitizenship } from "@/lib/citizenship";
import { getActiveCitizenshipCode } from "@/lib/citizenship.server";

export default async function HomePage() {
  const [citizenships, activeCode] = await Promise.all([
    getCitizenships(),
    getActiveCitizenshipCode(),
  ]);
  const active = resolveActiveCitizenship(citizenships, activeCode);
  const destinations = active ? ((await getDestinations(active.code)) ?? []) : [];

  return (
    <BrowseShell
      headerSlot={
        active && <CitizenshipSelector citizenships={citizenships} activeCode={active.code} />
      }
    >
      <div className="space-y-10">
        <section className="space-y-6">
          <div className="max-w-3xl space-y-3">
            <p className="text-sm font-medium text-(--text-2)">
              Immigration options, structured and source-aware.
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight text-(--text) sm:text-5xl">
              Where can a{" "}
              <span className="whitespace-nowrap">
                <span aria-hidden="true">{active?.flag}</span> {active?.name ?? "traveller"}
              </span>{" "}
              citizen go?
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-(--text-2)">
              Compare realistic migration paths at a glance — visas, residence routes, timelines,
              costs, and caveats, each marked with how trustworthy it is. Switch your passport any
              time from the header.
            </p>
          </div>

          {active && destinations.length > 0 ? (
            <MapHero citizenship={active} destinations={destinations} />
          ) : (
            <p className="text-(--text-2)">
              No destinations are available yet for this citizenship.
            </p>
          )}
        </section>

        {destinations.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-(--text-2)">
                All destinations
              </h2>
              <a
                href="/explore"
                className="text-sm font-medium text-(--brand) hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand)"
              >
                Compare & filter →
              </a>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {destinations.map((destination) => (
                <li key={destination.code}>
                  <DestinationCard citizenshipCode={active?.code ?? ""} destination={destination} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </BrowseShell>
  );
}
