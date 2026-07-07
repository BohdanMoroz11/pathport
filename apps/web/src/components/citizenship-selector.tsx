"use client";

import type { Citizenship } from "@pathport/contracts";
import { usePathname, useRouter } from "next/navigation";
import { DropdownMenu } from "radix-ui";
import { cn, focusRing } from "@/components/ui/cn";
import { CITIZENSHIP_COOKIE } from "@/lib/citizenship";

/**
 * The global "viewing as" citizenship selector, docked in the header next to the
 * theme toggle. Selecting a passport writes the {@link CITIZENSHIP_COOKIE} and
 * re-renders the current surface for it: cookie-driven pages (home, `/explore`)
 * just refresh; on the URL-driven destination shell it swaps the citizenship
 * segment so you stay on the same country for the new passport.
 */
export function CitizenshipSelector({
  citizenships,
  activeCode,
}: {
  citizenships: Citizenship[];
  activeCode: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const active =
    citizenships.find((c) => c.code === activeCode) ??
    citizenships.find((c) => c.code.toLowerCase() === activeCode.toLowerCase());

  function select(code: string) {
    if (code === active?.code) return;
    // Persist for a year; readable by the server on the next request. A plain
    // document.cookie write is deliberate — the async CookieStore API isn't
    // universally available and the server just needs the cookie on the next GET.
    // biome-ignore lint/suspicious/noDocumentCookie: see above; plain cookie the RSC reads on refresh.
    document.cookie = `${CITIZENSHIP_COOKIE}=${encodeURIComponent(code)}; path=/; max-age=31536000; samesite=lax`;

    const parts = pathname.split("/");
    // Shell path: /explore/{cz}/{dest}/… — swap the citizenship, keep the country.
    if (parts[1] === "explore" && parts.length >= 4) {
      parts[2] = code;
      router.push(parts.join("/"));
    } else {
      // Home / explore read the cookie server-side; re-render with the new value.
      router.refresh();
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label={`Viewing as ${active?.name ?? "…"}. Change citizenship`}
        className={cn(
          "inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-(--border) bg-(--surface)",
          "px-3 py-1.5 text-sm font-medium text-(--text) transition-colors hover:border-(--brand)",
          focusRing("brand"),
        )}
      >
        <span aria-hidden="true" className="text-base">
          {active?.flag ?? "🌐"}
        </span>
        <span className="hidden sm:inline">{active?.name ?? "Select citizenship"}</span>
        <span className="font-display text-xs text-(--text-3) sm:hidden">{active?.code ?? ""}</span>
        <span aria-hidden="true" className="text-(--text-3)">
          ▾
        </span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[13rem] rounded-[var(--radius-md)] border border-(--border) bg-(--surface) p-1 shadow-[var(--shadow)]"
        >
          <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-(--text-3)">
            Viewing as
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={active?.code} onValueChange={select}>
            {citizenships.map((citizenship) => (
              <DropdownMenu.RadioItem
                key={citizenship.code}
                value={citizenship.code}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm text-(--text-2)",
                  "outline-none data-[highlighted]:bg-(--surface-2) data-[highlighted]:text-(--text)",
                  "data-[state=checked]:text-(--text)",
                )}
              >
                <span aria-hidden="true" className="text-base">
                  {citizenship.flag ?? "🌐"}
                </span>
                <span className="flex-1 font-medium">{citizenship.name}</span>
                <span className="font-display text-xs text-(--text-3)">{citizenship.code}</span>
                <DropdownMenu.ItemIndicator aria-hidden="true" className="text-(--brand)">
                  ✓
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
