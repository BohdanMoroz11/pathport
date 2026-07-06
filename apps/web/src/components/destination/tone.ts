import type { AccentTone } from "@pathport/contracts";

/**
 * Tailwind class maps for the functional accent tokens, shared across the
 * destination views so a tone reads the same everywhere (Overview metrics,
 * Country stats, fit signals). The tokens themselves live in globals.css.
 */
export const TONE_BG: Record<AccentTone, string> = {
  pos: "bg-(--pos)",
  warn: "bg-(--warn)",
  danger: "bg-(--danger)",
  neutral: "bg-(--neutral)",
  brand: "bg-(--brand)",
  violet: "bg-(--violet)",
};

export const TONE_TEXT: Record<AccentTone, string> = {
  pos: "text-(--pos)",
  warn: "text-(--warn)",
  danger: "text-(--danger)",
  neutral: "text-(--neutral)",
  brand: "text-(--brand)",
  violet: "text-(--violet)",
};

export const TONE_BORDER: Record<AccentTone, string> = {
  pos: "border-l-(--pos)",
  warn: "border-l-(--warn)",
  danger: "border-l-(--danger)",
  neutral: "border-l-(--neutral)",
  brand: "border-l-(--brand)",
  violet: "border-l-(--violet)",
};
