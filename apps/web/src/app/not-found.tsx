import Link from "next/link";
import { BrowseShell } from "@/components/browse-shell";
import { focusRing } from "@/components/ui/cn";

export default function NotFound() {
  return (
    <BrowseShell>
      <div className="space-y-4 py-10">
        <p className="text-sm font-medium uppercase tracking-wide text-(--text-3)">404</p>
        <h1 className="font-display text-3xl font-semibold text-(--text)">
          We couldn't find that page
        </h1>
        <p className="max-w-xl text-(--text-2)">
          The citizenship, destination, or route you were looking for doesn't exist in the demo
          data.
        </p>
        <Link
          href="/"
          className={`inline-flex text-sm font-medium text-(--brand) hover:underline ${focusRing("brand")}`}
        >
          ← Back to citizenships
        </Link>
      </div>
    </BrowseShell>
  );
}
