/**
 * Minimal class combiner: joins truthy class fragments with a single space and
 * drops falsy ones, so components can compose conditional classes without a
 * runtime dependency. Not a Tailwind-aware merge — later fragments do not
 * override earlier ones, they append, which is all the primitives here need.
 */
export type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * The keyboard focus ring shared across every interactive surface in the shell:
 * a 2px offset outline in the given accent. Brand for content, violet for the
 * (dark, always-on) left rail. Kept in one place so focus reads identically
 * everywhere — the pattern was copy-pasted into a dozen components before S4.
 */
export function focusRing(accent: "brand" | "violet" = "brand"): string {
  return `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--${accent})`;
}
