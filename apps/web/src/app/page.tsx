import type { Citizenship } from "@pathport/contracts";
import { BrowseShell } from "@/components/browse-shell";
import { CitizenshipCard } from "@/components/index/citizenship-card";
import { Combobox, type ComboboxItem } from "@/components/ui/combobox";
import { getCitizenships } from "@/lib/api";

/** United States is the primary demo citizenship, so it leads the list. */
function withPrimaryFirst(citizenships: Citizenship[]): Citizenship[] {
  return [...citizenships].sort((a, b) => {
    if (a.code === "USA") return -1;
    if (b.code === "USA") return 1;
    return a.name.localeCompare(b.name);
  });
}

function toComboboxItem(citizenship: Citizenship): ComboboxItem {
  return {
    value: citizenship.code,
    label: citizenship.name,
    href: `/explore/${citizenship.code}`,
    glyph: citizenship.flag,
    hint: citizenship.code,
  };
}

export default async function HomePage() {
  const citizenships = withPrimaryFirst(await getCitizenships());

  return (
    <BrowseShell>
      <div className="space-y-12">
        <section className="max-w-3xl">
          <p className="mb-3 text-sm font-medium text-(--text-2)">
            Immigration options, structured and source-aware.
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-(--text) sm:text-5xl">
            Compare realistic migration paths without digging through scattered articles.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-(--text-2)">
            Pick your citizenship to see the destinations open to you, then drill into visas,
            residence routes, timelines, costs, and caveats — each marked with how trustworthy it
            is.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-(--text-2)">
            Choose your citizenship
          </h2>

          {citizenships.length === 0 ? (
            <p className="text-(--text-2)">No citizenships are available yet.</p>
          ) : (
            <>
              <Combobox
                items={citizenships.map(toComboboxItem)}
                label="Jump to your citizenship"
                hideLabel
                placeholder="Search citizenships…"
                emptyMessage="No matching citizenship."
                className="max-w-md"
              />
              <ul className="grid gap-3 sm:grid-cols-2">
                {citizenships.map((citizenship) => (
                  <li key={citizenship.code}>
                    <CitizenshipCard citizenship={citizenship} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </BrowseShell>
  );
}
