import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--muted)]">404</p>
      <h1 className="text-3xl font-semibold text-[var(--foreground)]">
        We couldn't find that page
      </h1>
      <p className="max-w-xl text-[var(--muted)]">
        The citizenship, destination, or route you were looking for doesn't exist in the demo data.
      </p>
      <Link
        href="/"
        className="inline-flex text-sm font-medium text-[var(--accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
      >
        ← Back to citizenships
      </Link>
    </div>
  );
}
