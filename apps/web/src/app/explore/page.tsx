import { BrowseShell } from "@/components/browse-shell";
import { CitizenshipSelector } from "@/components/citizenship-selector";
import { DestinationExplorer } from "@/components/explore/destination-explorer";
import { getCitizenships, getDestinations } from "@/lib/api";
import { resolveActiveCitizenship } from "@/lib/citizenship";
import { getActiveCitizenshipCode } from "@/lib/citizenship.server";

export default async function ExplorePage() {
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
      {/* Pad the bottom so the fixed compare tray never covers the last row. */}
      <div className="mx-auto w-full max-w-[90rem] px-6 py-10 pb-24 lg:px-10">
        <header className="max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-2 rounded-(--radius-pill) border border-(--border) bg-(--surface) px-3 py-1 text-xs font-medium text-(--text-2)">
            {active?.flag && <span aria-hidden="true">{active.flag}</span>}
            {active?.name ?? "Your"} passport
          </span>
          <h1 className="font-display text-3xl font-semibold text-(--text) sm:text-4xl">
            Explore destinations
          </h1>
          <p className="text-lg leading-8 text-(--text-2)">
            Every country open to {active?.name ?? "you"}. Filter and sort, then pick up to three to
            compare side by side.
          </p>
        </header>

        <div className="mt-8">
          {destinations.length === 0 ? (
            <p className="text-(--text-2)">
              No destinations are available yet for this citizenship.
            </p>
          ) : (
            <DestinationExplorer citizenshipCode={active?.code ?? ""} destinations={destinations} />
          )}
        </div>
      </div>
    </BrowseShell>
  );
}
