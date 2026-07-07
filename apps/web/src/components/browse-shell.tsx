import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { focusRing } from "@/components/ui/cn";

/**
 * Chrome for the browse screens (home, `/explore`, 404) — the surfaces that have
 * no selected destination, so the destination app-shell rail doesn't apply. A
 * light top bar carrying the brand mark, an Explore link, the global citizenship
 * selector, and the theme toggle over a centered content canvas. The destination
 * shell provides its own rail layout instead; this is the browse counterpart.
 *
 * `headerSlot` is where pages inject the citizenship selector (a client component
 * that needs the fetched citizenship list); surfaces without it (404) omit it.
 * `wide` widens the canvas for the explore browser.
 */
export function BrowseShell({
  children,
  headerSlot,
  wide = false,
}: {
  children: React.ReactNode;
  headerSlot?: React.ReactNode;
  wide?: boolean;
}) {
  const canvas = wide ? "max-w-6xl" : "max-w-5xl";
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-(--border) bg-(--surface)">
        <div
          className={`mx-auto flex w-full ${canvas} items-center justify-between gap-4 px-6 py-4`}
        >
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className={`flex items-center gap-2 ${focusRing("brand")} rounded-[var(--radius-sm)]`}
            >
              <span
                aria-hidden="true"
                className="grid size-7 place-items-center rounded-[var(--radius-md)] bg-(--brand) font-display text-sm font-bold text-(color:--on-brand)"
              >
                P
              </span>
              <span className="font-display text-base font-semibold text-(--text)">Pathport</span>
            </Link>
            <Link
              href="/explore"
              className={`hidden text-sm font-medium text-(--text-2) transition-colors hover:text-(--text) sm:inline ${focusRing("brand")} rounded-[var(--radius-sm)]`}
            >
              Explore
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {headerSlot}
            <ThemeToggle variant="bar" />
          </div>
        </div>
      </header>

      <main className={`mx-auto w-full ${canvas} flex-1 px-6 py-10`}>{children}</main>

      <footer className="border-t border-(--border) bg-(--surface)">
        <div className={`mx-auto w-full ${canvas} px-6 py-6 text-xs leading-5 text-(--text-2)`}>
          Pathport shows placeholder demo data for development. It is not immigration or legal
          advice. Always confirm details with official government sources.
        </div>
      </footer>
    </div>
  );
}
