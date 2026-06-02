import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-6 px-6 py-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-wide text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          Pathport
        </Link>
        <span className="text-xs text-[var(--muted)]">Immigration options explorer</span>
      </div>
    </header>
  );
}
