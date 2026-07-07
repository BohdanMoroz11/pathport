import { Slot } from "radix-ui";
import type { HTMLAttributes } from "react";
import { cn, focusRing } from "./cn";

/**
 * The bordered surface the whole destination shell is built from: a token-driven
 * `--surface` panel with a `--border` edge, in two radii. It replaces the ~two
 * dozen hand-written `rounded-… border border-(--border) bg-(--surface)` boxes
 * the reference page grew during S3.
 *
 * `interactive` adds the hover-lift + focus ring for cards that are links or
 * buttons; pair it with `asChild` so the anchor/button *is* the card (Radix Slot
 * merges the styling onto the child) and stays a single accessible tab stop.
 */
type Radius = "md" | "lg";
type Padding = "none" | "sm" | "md" | "lg";

const RADIUS: Record<Radius, string> = {
  md: "rounded-[var(--radius-md)]",
  lg: "rounded-[var(--radius-lg)]",
};

const PADDING: Record<Padding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export type CardProps = HTMLAttributes<HTMLElement> & {
  /** Render through Radix Slot onto the child (e.g. a Next `Link`). */
  asChild?: boolean;
  radius?: Radius;
  padding?: Padding;
  /** Add the hover + focus affordance for link/button cards. */
  interactive?: boolean;
};

export function Card({
  asChild = false,
  radius = "lg",
  padding = "lg",
  interactive = false,
  className,
  ...props
}: CardProps) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      className={cn(
        "border border-(--border) bg-(--surface)",
        RADIUS[radius],
        PADDING[padding],
        interactive &&
          `shadow-[var(--shadow-sm)] transition-colors hover:border-(--brand) ${focusRing("brand")}`,
        className,
      )}
      {...props}
    />
  );
}
