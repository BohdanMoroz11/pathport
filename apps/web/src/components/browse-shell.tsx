import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { focusRing } from "@/components/ui/cn";

/**
 * Chrome for the index screens (home, citizenship list, 404) — the surfaces that
 * have no selected destination, so the destination app-shell rail doesn't apply.
 * A light top bar carrying the brand mark and the theme toggle over a centered
 * content canvas, on the S1 tokens. The destination shell provides its own rail
 * layout instead; this is the browse counterpart, rebuilt in S5.
 */
export function BrowseShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-(--border) bg-(--surface)">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-4">
          <Link
            href="/"
            className={`flex items-center gap-2 ${focusRing("brand")} rounded-[var(--radius-sm)]`}
          >
            <span
              aria-hidden="true"
              className="grid size-7 place-items-center rounded-[var(--radius-md)] bg-(--brand) font-display text-sm font-bold text-(--on-brand)"
            >
              P
            </span>
            <span className="font-display text-base font-semibold text-(--text)">Pathport</span>
          </Link>
          <ThemeToggle variant="bar" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">{children}</main>

      <footer className="border-t border-(--border) bg-(--surface)">
        <div className="mx-auto w-full max-w-5xl px-6 py-6 text-xs leading-5 text-(--text-3)">
          Pathport shows placeholder demo data for development. It is not immigration or legal
          advice. Always confirm details with official government sources.
        </div>
      </footer>
    </div>
  );
}
