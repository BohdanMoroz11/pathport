import Link from "next/link";
import { BrowseShell } from "@/components/browse-shell";
import { CitizenshipSelector } from "@/components/citizenship-selector";
import { MapHero } from "@/components/home/map-hero";
import { DestinationCard } from "@/components/index/destination-card";
import { focusRing } from "@/components/ui/cn";
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

  const totalRoutes = destinations.reduce((sum, d) => sum + d.routeCount, 0);
  const regionCount = new Set(destinations.map((d) => d.region).filter(Boolean)).size;

  return (
    <BrowseShell
      headerSlot={
        active && <CitizenshipSelector citizenships={citizenships} activeCode={active.code} />
      }
    >
      {/* Full-bleed hero */}
      <section className="relative overflow-hidden bg-(--rail-bg) text-(--rail-text)">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(60% 60% at 15% 0%, var(--glow-violet), transparent 60%), radial-gradient(50% 50% at 100% 100%, var(--glow-brand), transparent 55%)",
          }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-14 lg:grid-cols-[0.85fr_1.15fr] lg:py-20">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-(--radius-pill) border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-(--rail-text-2)">
              {active?.flag && <span aria-hidden="true">{active.flag}</span>}
              For {active?.name ?? "your"} passport holders
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-[var(--tracking-display)] text-(--rail-text) sm:text-5xl lg:text-6xl">
              Where can you{" "}
              <span className="bg-[image:var(--gradient-brand)] bg-clip-text text-transparent">
                live next?
              </span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-8 text-(--rail-text-2)">
              Compare realistic migration paths at a glance — visas, residence routes, timelines,
              costs, and caveats, each marked with how trustworthy it is. Switch your passport any
              time from the header.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/explore"
                className={`inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[image:var(--gradient-brand)] px-5 text-sm font-semibold text-(color:--on-brand) shadow-[0_10px_30px_-10px_var(--glow-brand)] transition hover:brightness-105 ${focusRing("brand")}`}
              >
                Browse all destinations →
              </Link>
              {active && (
                <a
                  href="#all-destinations"
                  className={`inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-white/15 px-5 text-sm font-medium text-(--rail-text) transition hover:bg-white/5 ${focusRing("brand")}`}
                >
                  See the map
                </a>
              )}
            </div>
            {destinations.length > 0 && (
              <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
                <HeroStat value={String(destinations.length)} label="destinations" />
                <HeroStat value={String(totalRoutes)} label="migration routes" />
                {regionCount > 0 && <HeroStat value={String(regionCount)} label="world regions" />}
              </dl>
            )}
          </div>

          <div>
            {active && destinations.length > 0 ? (
              <MapHero citizenship={active} destinations={destinations} />
            ) : (
              <p className="rounded-[var(--radius-lg)] border border-white/10 bg-white/[0.03] p-8 text-(--rail-text-2)">
                No destinations are available yet for this citizenship.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Destinations grid */}
      {destinations.length > 0 && (
        <section id="all-destinations" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-(--text)">
                All destinations
              </h2>
              <p className="mt-1 text-sm text-(--text-2)">
                Every country open to {active?.name ?? "you"}, ranked by how many routes apply.
              </p>
            </div>
            <a
              href="/explore"
              className={`shrink-0 text-sm font-medium text-(--brand) hover:underline ${focusRing("brand")} rounded-[var(--radius-sm)]`}
            >
              Compare &amp; filter →
            </a>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {destinations.map((destination) => (
              <li key={destination.code}>
                <DestinationCard citizenshipCode={active?.code ?? ""} destination={destination} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </BrowseShell>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="font-display text-2xl font-semibold text-(--rail-text)">{value}</dt>
      <dd className="text-xs uppercase tracking-wide text-(--rail-text-2)">{label}</dd>
    </div>
  );
}
