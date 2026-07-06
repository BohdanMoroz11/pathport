import { notFound } from "next/navigation";
import {
  DestinationMedia,
  EntryBrief,
  FitsYou,
  GlanceList,
  ModuleHeading,
} from "@/components/destination/overview";
import { getDestinationProfile } from "@/lib/api";
import { destinationBasePath } from "@/lib/destination/sections";

/**
 * Destination Overview — the Phase 2 / S3 reference page. A real country read
 * (description + headline metrics + a citizenship-specific fit) that orients
 * someone before they drill into the section views via the rail. Rendered from
 * the in-repo fixture; the shape it needs is what drives the domain schema.
 */
export default async function DestinationOverviewPage({
  params,
}: {
  params: Promise<{ citizenship: string; destination: string }>;
}) {
  const { citizenship, destination } = await params;
  const profile = await getDestinationProfile(citizenship, destination);
  if (!profile) {
    notFound();
  }

  const basePath = destinationBasePath(profile.citizenship.code, profile.destination.code);
  // Split the spec list into two balanced columns for wide screens.
  const half = Math.ceil(profile.glance.length / 2);
  const glanceColumns = [profile.glance.slice(0, half), profile.glance.slice(half)];

  return (
    <div className="space-y-10">
      <header>
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-(--brand)">
          <span aria-hidden="true">
            {profile.citizenship.flag} → {profile.destination.flag}
          </span>
          Destination
        </p>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <h1 className="font-display text-4xl font-semibold tracking-[var(--tracking-display)] text-(--text) sm:text-[length:var(--fs-4xl)]">
              {profile.destination.name}
            </h1>
            <p className="text-base leading-7 text-(--text-2)">{profile.destination.description}</p>
            <EntryBrief entry={profile.entry} basePath={basePath} />
          </div>

          <DestinationMedia
            flag={profile.destination.flag}
            name={profile.destination.name}
            code={profile.destination.code}
            facts={profile.quickFacts}
          />
        </div>
      </header>

      <section className="space-y-4">
        <ModuleHeading emoji="⚡">At a glance</ModuleHeading>
        <div className="grid items-start gap-4 lg:grid-cols-2">
          {glanceColumns.map((column, i) => (
            <GlanceList
              // biome-ignore lint/suspicious/noArrayIndexKey: two fixed positional columns
              key={i}
              metrics={column}
              basePath={basePath}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <ModuleHeading emoji="✨">This fits you if</ModuleHeading>
        <FitsYou items={profile.fitsYouIf} />
      </section>
    </div>
  );
}
