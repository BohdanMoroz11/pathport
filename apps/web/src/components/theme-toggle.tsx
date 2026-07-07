"use client";

import { useEffect, useState } from "react";
import { cn } from "@/components/ui/cn";

type Theme = "dark" | "light";

const STORAGE_KEY = "pathport-theme";

/**
 * The theme switch, shared by the dark left rail (`rail`) and the light/dark
 * index chrome (`bar`). Dark is the default (no attribute); choosing a theme sets
 * `data-theme` on <html> and persists it. The no-flash bootstrap in the root
 * layout applies the stored value before paint, so this only mirrors/updates it.
 */
export function ThemeToggle({ variant = "rail" }: { variant?: "rail" | "bar" }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const current = document.documentElement.dataset.theme;
    setTheme(current === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Persisting is best-effort; the toggle still works for the session.
    }
  }

  // Before mount the real theme is unknown, so render a stable neutral label to
  // avoid a hydration mismatch; the effect fills in the true state.
  const label = !mounted ? "Theme" : theme === "dark" ? "Dark mode" : "Light mode";

  const rail = [
    "w-full justify-center gap-2 rounded-[var(--radius-md)] border border-(--rail-border) bg-(--rail-bg-2)",
    "px-3 py-2 text-sm font-medium text-(--rail-text-2) hover:text-(--rail-text)",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--violet)",
  ];
  const bar = [
    "gap-2 rounded-[var(--radius-md)] border border-(--border) bg-(--surface)",
    "px-3 py-1.5 text-sm font-medium text-(--text-2) hover:border-(--brand) hover:text-(--text)",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--brand)",
  ];

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={mounted ? theme === "light" : undefined}
      className={cn(
        "inline-flex items-center transition-colors",
        ...(variant === "rail" ? rail : bar),
      )}
    >
      <span aria-hidden="true">{"◐"}</span>
      {label}
    </button>
  );
}
