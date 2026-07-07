import { Slot } from "radix-ui";
import type { ButtonHTMLAttributes } from "react";
import { cn, focusRing } from "./cn";

/**
 * The shell's button, on the S1 tokens. Three intents — a brand-filled
 * `primary` (the rail's main action), a bordered `secondary` (toggles, the
 * drawer close), and a chromeless `ghost` — across a normal and a square `icon`
 * size. `asChild` renders the styling onto a child (e.g. a Next `Link`) via
 * Radix Slot, so a link-button stays a real anchor.
 */
type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "sm" | "icon";

const VARIANT: Record<Variant, string> = {
  primary: "bg-(--brand) text-(color:--on-brand) hover:brightness-95",
  secondary:
    "border border-(--border) bg-(--surface) text-(--text-2) hover:border-(--brand) hover:text-(--text)",
  ghost: "text-(--text-2) hover:bg-(--surface-2) hover:text-(--text)",
};

const SIZE: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  sm: "h-8 px-3 text-sm",
  icon: "size-8",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  asChild = false,
  className,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      // Slot forwards to a child that sets its own semantics (e.g. an anchor),
      // so only add the button `type` when we actually render a <button>.
      {...(asChild ? {} : { type: type ?? "button" })}
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-md)] font-medium transition disabled:pointer-events-none disabled:opacity-50",
        VARIANT[variant],
        SIZE[size],
        focusRing("brand"),
        className,
      )}
      {...props}
    />
  );
}
