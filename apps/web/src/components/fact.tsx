/** A single label/value pair inside a definition list (`<dl>`). */
export function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-(--muted)">{label}</dt>
      <dd className="mt-0.5 text-sm text-(--foreground)">{value}</dd>
    </div>
  );
}
