import type { DestinationSummary } from "@pathport/contracts";
import Link from "next/link";
import { Dialog as RadixDialog } from "radix-ui";
import { Badge } from "@/components/ui/badge";
import { formatCost } from "@/lib/format";

function fromCostOf(destination: DestinationSummary): string {
  return destination.startingCost
    ? formatCost({
        min: destination.startingCost.amount,
        max: destination.startingCost.amount,
        currency: destination.startingCost.currency,
      })
    : "—";
}

type Row = { label: string; render: (d: DestinationSummary) => React.ReactNode };

const ROWS: Row[] = [
  { label: "Region", render: (d) => d.region ?? "—" },
  { label: "Routes", render: (d) => d.routeCount },
  { label: "From", render: fromCostOf },
  {
    label: "As fast as",
    render: (d) =>
      d.fastestMonths ? `${d.fastestMonths} month${d.fastestMonths === 1 ? "" : "s"}` : "—",
  },
  {
    label: "Visa-free",
    render: (d) =>
      d.arrivalContext?.visaFreeDays != null ? `${d.arrivalContext.visaFreeDays} days` : "—",
  },
  {
    label: "Route types",
    render: (d) => (
      <span className="flex flex-wrap gap-1">
        {d.routeTypes.map((t) => (
          <Badge key={t} size="xs">
            {t.replace(/_/g, " ")}
          </Badge>
        ))}
      </span>
    ),
  },
];

/**
 * Side-by-side comparison of the picked destinations, in a wide Radix Dialog.
 * The metric rows line up the same aggregates the cards show, so differences are
 * scannable at a glance — the core product promise.
 */
export function CompareDialog({
  citizenshipCode,
  destinations,
  open,
  onOpenChange,
}: {
  citizenshipCode: string;
  destinations: DestinationSummary[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-(--backdrop)" />
        <RadixDialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(56rem,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-[var(--radius-lg)] border border-(--border) bg-(--surface) p-6 shadow-[var(--shadow)] focus:outline-none">
          <div className="flex items-center justify-between gap-4">
            <RadixDialog.Title className="font-display text-xl font-semibold text-(--text)">
              Compare destinations
            </RadixDialog.Title>
            <RadixDialog.Close
              aria-label="Close"
              className="grid size-8 place-items-center rounded-[var(--radius-sm)] text-(--text-3) transition-colors hover:bg-(--surface-2) hover:text-(--text)"
            >
              ✕
            </RadixDialog.Close>
          </div>
          <RadixDialog.Description className="mt-1 text-sm text-(--text-2)">
            The same metrics, lined up side by side.
          </RadixDialog.Description>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-28 p-2" />
                  {destinations.map((d) => (
                    <th key={d.code} className="min-w-36 p-2 text-left align-bottom">
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true" className="text-xl">
                          {d.flag ?? "🌐"}
                        </span>
                        <Link
                          href={`/explore/${citizenshipCode}/${d.code}`}
                          className="font-display text-base font-semibold text-(--text) hover:text-(--brand) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand)"
                        >
                          {d.name}
                        </Link>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="border-t border-(--border)">
                    <th
                      scope="row"
                      className="p-2 text-left text-xs font-semibold uppercase tracking-wide text-(--text-2)"
                    >
                      {row.label}
                    </th>
                    {destinations.map((d) => (
                      <td key={d.code} className="p-2 align-top font-medium text-(--text)">
                        {row.render(d)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
