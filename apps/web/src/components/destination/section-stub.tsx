import type { DestinationSection } from "@/lib/destination/sections";
import { SectionIntro } from "./section-intro";

/**
 * Placeholder body for the destination sections scaffolded in S3 but not yet
 * built (Country, Routes, Living, Family, Entry). It establishes the section's
 * route, rail entry, and head so the shell reads as complete, and names the data
 * the section will eventually hold — which is where its schema gets designed.
 */
export function SectionStub({
  section,
  destinationName,
  planned,
}: {
  section: DestinationSection;
  destinationName: string;
  planned: string[];
}) {
  return (
    <div className="space-y-8">
      <SectionIntro
        eyebrow={
          <>
            <span aria-hidden="true">{section.emoji}</span>
            {section.label}
          </>
        }
        title={`${section.label} — ${destinationName}`}
        lead={section.blurb}
      />

      <div className="rounded-[var(--radius-lg)] border border-dashed border-(--border-strong) bg-(--surface) p-6">
        <p className="text-sm font-medium text-(--text)">This section is being built.</p>
        <p className="mt-1 text-sm text-(--text-2)">
          The Overview is the S3 reference page; the deeper sections are scaffolded so the shell is
          navigable while their data shape is designed. This view will cover:
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {planned.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 rounded-[var(--radius-md)] border border-(--border) bg-(--surface-2) px-3 py-2 text-sm text-(--text-2)"
            >
              <span aria-hidden="true" className="text-(--text-3)">
                ·
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
