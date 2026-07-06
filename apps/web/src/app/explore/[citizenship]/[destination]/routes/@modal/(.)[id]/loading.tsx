/**
 * Shown in the peek drawer's place while the route detail is fetched. A static
 * skeleton of the sheet (no interactivity needed for the sub-second wait) so the
 * open feels instant even before the data lands.
 */
export default function RouteDrawerLoading() {
  return (
    <div className="fixed inset-0 z-50" aria-hidden="true">
      <div className="absolute inset-0 bg-(--backdrop)" />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col bg-(--bg) shadow-(--shadow-lg)">
        <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-(--text-3)">
            Route detail
          </span>
        </div>
        <div className="grow space-y-4 px-6 py-6">
          <div className="h-6 w-1/3 animate-pulse rounded-(--radius-pill) bg-(--surface-2)" />
          <div className="h-8 w-2/3 animate-pulse rounded-(--radius-md) bg-(--surface-2)" />
          <div className="h-16 w-full animate-pulse rounded-(--radius-md) bg-(--surface-2)" />
          <div className="h-24 w-full animate-pulse rounded-(--radius-md) bg-(--surface-2)" />
        </div>
      </div>
    </div>
  );
}
