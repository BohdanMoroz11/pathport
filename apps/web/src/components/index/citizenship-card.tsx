import type { Citizenship } from "@pathport/contracts";
import Link from "next/link";
import { Card } from "@/components/ui/card";

/**
 * A citizenship on the home index: flag + name + code, linking into that
 * passport's destination list. The whole card is the link (a single tab stop).
 */
export function CitizenshipCard({ citizenship }: { citizenship: Citizenship }) {
  return (
    <Card asChild interactive padding="md" className="group h-full">
      <Link href={`/explore/${citizenship.code}`} className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-[var(--radius-md)] bg-(--surface-2) text-2xl"
        >
          {citizenship.flag ?? "🌐"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-base font-semibold text-(--text)">
            {citizenship.name}
          </span>
          <span className="text-xs font-medium uppercase tracking-wide text-(--text-2)">
            {citizenship.code}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 text-(--text-3) transition-colors group-hover:text-(--brand)"
        >
          →
        </span>
      </Link>
    </Card>
  );
}
