"use client";

import type {
  CitizenshipIdentity,
  DestinationIdentity,
  DestinationSummary,
} from "@pathport/contracts";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { CITIZENSHIP_COOKIE } from "@/lib/citizenship";
import { DESTINATION_SECTIONS, destinationBasePath, sectionHref } from "@/lib/destination/sections";

type DestinationRailProps = {
  citizenship: CitizenshipIdentity;
  destination: DestinationIdentity;
  /** Every destination open to this citizenship, powering the rail's jump search. */
  destinations: DestinationSummary[];
};

export function DestinationRail({ citizenship, destination, destinations }: DestinationRailProps) {
  const pathname = usePathname();
  const router = useRouter();
  const basePath = destinationBasePath(citizenship.code, destination.code);

  function isActive(slug: string): boolean {
    const href = sectionHref(basePath, slug);
    return slug === "" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  }

  // The browse pages (home, /explore) read the active citizenship from a cookie;
  // sync it to the shell's URL citizenship before heading there so they agree.
  function goToExplore() {
    // biome-ignore lint/suspicious/noDocumentCookie: plain cookie the RSC reads on the next GET.
    document.cookie = `${CITIZENSHIP_COOKIE}=${encodeURIComponent(citizenship.code)}; path=/; max-age=31536000; samesite=lax`;
    router.push("/explore");
  }

  return (
    <div className="flex h-full flex-col gap-6 bg-(--rail-bg) px-4 py-5 text-(--rail-text)">
      <Link
        href="/"
        className="flex items-center gap-2 px-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--violet)"
      >
        <span
          aria-hidden="true"
          className="grid size-7 place-items-center rounded-[var(--radius-md)] bg-(--brand) font-display text-sm font-bold text-(color:--on-brand)"
        >
          P
        </span>
        <span className="font-display text-base font-semibold">Pathport</span>
      </Link>

      {/* Jump to another destination open to this citizenship (S5). */}
      <Combobox
        variant="rail"
        label="Search destinations"
        hideLabel
        placeholder="Search countries…"
        emptyMessage="No matching destination."
        items={destinations.map((d) => ({
          value: d.code,
          label: d.name,
          href: sectionHref(destinationBasePath(citizenship.code, d.code), ""),
          glyph: d.flag,
          hint: d.code,
        }))}
      />

      <p className="px-1 text-xs text-(--rail-text-2)">
        Viewing as <span aria-hidden="true">{citizenship.flag}</span>{" "}
        <span className="font-medium text-(--rail-text)">{citizenship.name}</span> ·{" "}
        <button
          type="button"
          onClick={goToExplore}
          className="text-(--rail-active-text) hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--violet)"
        >
          change
        </button>
      </p>

      {/* Destination identity card */}
      <div className="rounded-[var(--radius-lg)] border border-(--rail-border) bg-(--rail-bg-2) p-4">
        <div aria-hidden="true" className="text-2xl">
          {destination.flag}
        </div>
        <h2 className="mt-2 font-display text-lg font-semibold">{destination.name}</h2>
        <p className="mt-1 text-xs leading-5 text-(--rail-text-2)">{destination.tagline}</p>
        <Button className="mt-3 w-full" onClick={goToExplore}>
          Compare destinations
        </Button>
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
