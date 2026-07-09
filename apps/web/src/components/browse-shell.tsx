import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { focusRing } from "@/components/ui/cn";

/**
 * Chrome for the browse screens (home, `/explore`, 404) — the surfaces that have
 * no selected destination, so the destination app-shell rail doesn't apply. A
 * sticky, translucent top bar carrying the brand mark, an Explore link, the
 * global citizenship selector, and the theme toggle; a full-width `main` so a
 * page can run a full-bleed hero and center the rest itself; and a real product
 * footer. The destination shell provides its own rail layout instead.
 *
 * `headerSlot` is where pages inject the citizenship selector (a client
 * component that needs the fetched citizenship list); surfaces without it (404)
 * omit it. Pages own their own content width — wrap non-bleed content in
 * `mx-auto max-w-7xl px-6` (see the home and explore pages).
 */
export function BrowseShell({
  children,
  headerSlot,
}: {
  children: React.ReactNode;
  headerSlot?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-(--border) bg-(--surface)/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`flex items-center gap-2.5 ${focusRing("brand")} rounded-[var(--radius-sm)]`}
            >
              <span
                aria-hidden="true"
                className="grid size-8 place-items-center rounded-[var(--radius-md)] bg-[image:var(--gradient-brand)] font-display text-sm font-bold text-(color:--on-brand) shadow-[0_2px_12px_-2px_var(--glow-brand)]"
              >
                P
              </span>
              <span className="font-display text-base font-semibold tracking-[var(--tracking-display)] text-(--text)">
                Pathport
              </span>
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

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-(--border) bg-(--surface)">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-12 md:grid-cols-[1.5fr_1fr]">
          <div className="max-w-md space-y-3">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="grid size-7 place-items-center rounded-[var(--radius-md)] bg-[image:var(--gradient-brand)] font-display text-xs font-bold text-(color:--on-brand)"
              >
                P
              </span>
              <span className="font-display text-sm font-semibold text-(--text)">Pathport</span>
            </div>
            <p className="text-sm leading-6 text-(--text-2)">
              A calm, source-aware explorer for immigration and long-term relocation options —
              compare visas, residence routes, timelines, and costs across destinations at a glance.
            </p>
          </div>
          <div className="space-y-3 text-sm md:text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-(--text-2)">
              Good to know
            </p>
            <p className="leading-6 text-(--text-2)">
              Pathport organizes publicly available information to help you compare paths. It is not
              immigration or legal advice — always confirm details with official government sources
              before you act.
            </p>
          </div>
        </div>
        <div className="border-t border-(--border)">
          <div className="mx-auto w-full max-w-7xl px-6 py-4 text-xs text-(--text-2)">
            © {new Date().getFullYear()} Pathport
          </div>
        </div>
      </footer>
    </div>
  );
}
