/** Shared className for the interactive cards used across the explorer. */
export const linkCardClass = [
  "group flex h-full flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5",
  "transition hover:border-[var(--accent)] hover:shadow-sm",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
].join(" ");

/** Shared className for a static (non-interactive) panel. */
export const panelClass = "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5";
