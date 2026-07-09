import Link from "next/link";
import { BrowseShell } from "@/components/browse-shell";
import { focusRing } from "@/components/ui/cn";

export default function NotFound() {
  return (
    <BrowseShell>
      <div className="mx-auto max-w-7xl space-y-4 px-6 py-20">
        <p className="text-sm font-medium uppercase tracking-wide text-(--text-2)">404</p>
        <h1 className="font-display text-3xl font-semibold text-(--text) sm:text-4xl">
          We couldn't find that page
        </h1>
        <p className="max-w-xl text-lg leading-8 text-(--text-2)">
          The citizenship, destination, or route you were looking for doesn't exist here.
        </p>
        <Link
          href="/"
          className={`inline-flex text-sm font-medium text-(--brand) hover:underline ${focusRing("brand")} rounded-[var(--radius-sm)]`}
        >
          ← Back to home
        </Link>
      </div>
    </BrowseShell>
  );
}
