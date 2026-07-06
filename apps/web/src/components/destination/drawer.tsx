"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The peek sheet for a route's detail: a right-side panel over a dimmed backdrop,
 * shown when the Routes list is navigated to a `.../routes/[id]` URL via the
 * intercepting parallel route. Closing routes back to the list — which stays
 * mounted underneath, so scroll position and sort are preserved. On a hard load
 * or shared link the same URL renders as a full page instead (no interception).
 */
export function Drawer({
  title,
  children,
}: {
  /** Accessible label for the dialog (the route title). */
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const close = useCallback(() => router.back(), [router]);

  // Enter transition: mount off-screen, then slide in on the next frame.
  useEffect(() => setOpen(true), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    document.addEventListener("keydown", onKey);
    // Lock the page behind the sheet so only the panel scrolls.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [close]);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Close route detail"
        onClick={close}
        className={`absolute inset-0 bg-(--backdrop) transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col bg-(--bg) shadow-(--shadow-lg) outline-none transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-(--border) px-6 py-4">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-(--text-3)">
            Route detail
          </span>
          <button
            type="button"
            onClick={close}
            className="grid size-8 place-items-center rounded-[var(--radius-md)] border border-(--border) text-(--text-2) transition-colors hover:bg-(--surface-2) hover:text-(--text) focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand)"
          >
            <span aria-hidden="true">✕</span>
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="grow overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  );
}
