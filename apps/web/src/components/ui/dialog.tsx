"use client";

import { Dialog as RadixDialog } from "radix-ui";
import type { ReactNode } from "react";

/**
 * A token-styled Dialog over the Radix primitive: Radix owns behaviour and
 * accessibility (focus trap, escape, aria), our tokens own every visual.
 * This is the reference pattern for building custom UI on Radix (S4).
 */
export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export function DialogContent({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 bg-black/55" />
      <RadixDialog.Content
        className={[
          "fixed left-1/2 top-1/2 w-[min(28rem,92vw)] -translate-x-1/2 -translate-y-1/2",
          "rounded-[var(--radius-lg)] border border-(--border) bg-(--surface) p-6",
          "shadow-[var(--shadow)] focus:outline-none",
        ].join(" ")}
      >
        <RadixDialog.Title className="text-lg font-semibold text-(--text)">
          {title}
        </RadixDialog.Title>
        {description ? (
          <RadixDialog.Description className="mt-1 text-sm text-(--text-2)">
            {description}
          </RadixDialog.Description>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
        <RadixDialog.Close
          aria-label="Close"
          className={[
            "absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-[var(--radius-sm)]",
            "text-(--text-3) transition-colors hover:bg-(--surface-2) hover:text-(--text)",
          ].join(" ")}
        >
          ✕
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}
