import type { Citizenship } from "@pathport/contracts";
import { CitizenshipPicker } from "@/components/citizenship-picker";
import { Hero } from "@/components/hero";
import { getCitizenships } from "@/lib/api";

/** United States is the primary demo citizenship, so it leads the list. */
function withPrimaryFirst(citizenships: Citizenship[]): Citizenship[] {
  return [...citizenships].sort((a, b) => {
    if (a.code === "USA") return -1;
    if (b.code === "USA") return 1;
    return a.name.localeCompare(b.name);
  });
}

export default async function HomePage() {
  const citizenships = withPrimaryFirst(await getCitizenships());

  return (
    <div className="space-y-12">
      <Hero />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
          Choose your citizenship
        </h2>
        <CitizenshipPicker citizenships={citizenships} />
      </section>
    </div>
  );
}
