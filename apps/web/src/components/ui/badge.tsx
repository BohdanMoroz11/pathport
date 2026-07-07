import type { AccentTone } from "@pathport/contracts";
import type { HTMLAttributes } from "react";
import { cn } from "./cn";
import { TONE_BG, TONE_BORDER, TONE_SOFT_BG, TONE_TEXT } from "./tone";

/**
 * The pill used for every small status/label chip in the shell — route types,
 * complexity, trend direction, tags, quality labels. Two visual families:
 *
 * - `outline` — a bordered `--surface` pill. With a `tone` the edge + text pick
 *   up the accent (the trend/complexity signal); without one it is the neutral
 *   tag/type chip.
 * - `soft` — a low-opacity tone fill with matching text (quality labels).
 *
 * `dot` prepends a small tone dot for the ordinal signals. Because a tone alone
 * is never the only cue (there is always text, and often a glyph/dot), these
 * stay legible without colour — matching the data-viz guidance the shell follows.
 */
type Variant = "outline" | "soft";
type Size = "xs" | "sm" | "md";

const SIZE: Record<Size, string> = {
  xs: "px-2 py-0.5 text-xs",
  sm: "px-2.5 py-1 text-xs",
  md: "px-3 py-1 text-sm",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: Variant;
  tone?: AccentTone;
  size?: Size;
  /** Prepend a small tone dot (needs `tone`). */
  dot?: boolean;
};

export function Badge({
  variant = "outline",
  tone,
  size = "sm",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const toneClasses =
    variant === "soft"
      ? cn(tone ? TONE_SOFT_BG[tone] : "bg-(--neutral-soft)", TONE_TEXT[tone ?? "neutral"])
      : tone
        ? cn("border bg-(--surface)", TONE_BORDER[tone], TONE_TEXT[tone])
        : "border border-(--border) bg-(--surface) text-(--text-2)";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-(--radius-pill) font-medium",
        SIZE[size],
        toneClasses,
        className,
      )}
      {...props}
    >
      {dot && tone && (
        <span aria-hidden="true" className={cn("size-1.5 rounded-full", TONE_BG[tone])} />
      )}
      {children}
    </span>
  );
}
