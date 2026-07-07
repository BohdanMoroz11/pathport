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
      wide
      headerSlot={
        active && <CitizenshipSelector citizenships={citizenships} activeCode={active.code} />
      }
    >
      {/* Pad the bottom so the fixed compare tray never covers the last row. */}
      <div className="space-y-6 pb-24">
        <header className="space-y-2">
          <h1 className="flex items-center gap-3 font-display text-3xl font-semibold text-(--text)">
            {active?.flag && <span aria-hidden="true">{active.flag}</span>}
            Explore destinations
          </h1>
          <p className="max-w-2xl text-(--text-2)">
            Every country open to {active?.name ?? "you"}. Filter and sort, then pick up to three to
            compare side by side.
          </p>
        </header>

        {destinations.length === 0 ? (
          <p className="text-(--text-2)">No destinations are available yet for this citizenship.</p>
        ) : (
          <DestinationExplorer citizenshipCode={active?.code ?? ""} destinations={destinations} />
        )}
      </div>
    </BrowseShell>
  );
}
