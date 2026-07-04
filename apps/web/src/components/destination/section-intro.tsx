/**
 * The standard head of a destination section view: a small coloured eyebrow, a
 * display-font title, and a lead paragraph. Shared by the Overview and every
 * deeper section so they read as one family.
 */
export function SectionIntro({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: React.ReactNode;
  title: string;
  /** Optional lead paragraph; omitted where the section opens on its own nav. */
  lead?: string;
}) {
  return (
    <header className="space-y-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-(--brand)">
        {eyebrow}
      </p>
      <h1 className="font-display text-3xl font-semibold text-(--text) sm:text-[length:var(--fs-3xl)]">
        {title}
      </h1>
      {lead && <p className="max-w-2xl text-(--text-2)">{lead}</p>}
    </header>
  );
}
