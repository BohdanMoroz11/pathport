import type { Citizenship } from "@pathport/contracts";
import Link from "next/link";
import { linkCardClass } from "@/lib/styles";

export function CitizenshipPicker({ citizenships }: { citizenships: Citizenship[] }) {
  if (citizenships.length === 0) {
    return <p className="text-[var(--muted)]">No citizenships are available yet.</p>;
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {citizenships.map((citizenship) => (
        <li key={citizenship.code}>
          <Link href={`/explore/${citizenship.code}`} className={linkCardClass}>
            <span className="flex items-center justify-between gap-3">
              <span className="text-lg font-semibold text-[var(--foreground)]">
                {citizenship.name}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                {citizenship.code}
              </span>
            </span>
            <span className="text-sm text-[var(--accent)] group-hover:underline">
              See destinations →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
