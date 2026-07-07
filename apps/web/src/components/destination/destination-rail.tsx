"use client";

import type { CitizenshipIdentity, DestinationIdentity } from "@pathport/contracts";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { DESTINATION_SECTIONS, destinationBasePath, sectionHref } from "@/lib/destination/sections";

type DestinationRailProps = {
  citizenship: CitizenshipIdentity;
  destination: DestinationIdentity;
};

export function DestinationRail({ citizenship, destination }: DestinationRailProps) {
  const pathname = usePathname();
  const basePath = destinationBasePath(citizenship.code, destination.code);

  function isActive(slug: string): boolean {
    const href = sectionHref(basePath, slug);
    return slug === "" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div className="flex h-full flex-col gap-6 bg-(--rail-bg) px-4 py-5 text-(--rail-text)">
      <Link
        href="/"
        className="flex items-center gap-2 px-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--violet)"
      >
        <span
          aria-hidden="true"
          className="grid size-7 place-items-center rounded-[var(--radius-md)] bg-(--brand) font-display text-sm font-bold text-(--on-brand)"
        >
          P
        </span>
        <span className="font-display text-base font-semibold">Pathport</span>
      </Link>

      {/* Country search is visual-only in S3; wired to the picker pattern in S4. */}
      <div className="relative">
        <span
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-(--rail-text-2)"
        >
          {"\u{1F50D}"}
        </span>
        <input
          type="search"
          disabled
          placeholder="Search countries…"
          aria-label="Search countries (coming soon)"
          className="w-full rounded-[var(--radius-md)] border border-(--rail-border) bg-(--rail-bg-2) py-2 pl-9 pr-3 text-sm text-(--rail-text) placeholder:text-(--rail-text-2)"
        />
      </div>

      <p className="px-1 text-xs text-(--rail-text-2)">
        Viewing as <span aria-hidden="true">{citizenship.flag}</span>{" "}
        <span className="font-medium text-(--rail-text)">{citizenship.name}</span> ·{" "}
        <Link
          href={`/explore/${citizenship.code}`}
          className="text-(--rail-active-text) hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--violet)"
        >
          change
        </Link>
      </p>

      {/* Destination identity card */}
      <div className="rounded-[var(--radius-lg)] border border-(--rail-border) bg-(--rail-bg-2) p-4">
        <div aria-hidden="true" className="text-2xl">
          {destination.flag}
        </div>
        <h2 className="mt-2 font-display text-lg font-semibold">{destination.name}</h2>
        <p className="mt-1 text-xs leading-5 text-(--rail-text-2)">{destination.tagline}</p>
        <Button className="mt-3 w-full">Compare destinations</Button>
      </div>

      <nav aria-label="Destination sections" className="flex-1">
        <ul className="flex flex-col gap-1">
          {DESTINATION_SECTIONS.map((section) => {
            const active = isActive(section.slug);
            return (
              <li key={section.slug || "overview"}>
                <Link
                  href={sectionHref(basePath, section.slug)}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors",
                    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--violet)",
                    active
                      ? "bg-(--rail-active-bg) font-medium text-(--rail-active-text)"
                      : "text-(--rail-text-2) hover:bg-(--rail-bg-2) hover:text-(--rail-text)",
                  ].join(" ")}
                >
                  <span aria-hidden="true" className="text-base">
                    {section.emoji}
                  </span>
                  {section.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <ThemeToggle />
    </div>
  );
}
