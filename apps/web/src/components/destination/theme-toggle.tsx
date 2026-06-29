"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "pathport-theme";

/**
 * Rail theme switch. Dark is the default (no attribute); choosing a theme sets
 * `data-theme` on <html> and persists it. The no-flash bootstrap in the root
 * layout applies the stored value before paint, so this only mirrors/updates it.
 */
export function ThemeToggle() {
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

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={mounted ? theme === "light" : undefined}
      className={[
        "flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)]",
        "border border-(--rail-border) bg-(--rail-bg-2) px-3 py-2",
        "text-sm font-medium text-(--rail-text-2)",
        "transition-colors hover:text-(--rail-text)",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--violet)",
      ].join(" ")}
    >
      <span aria-hidden="true">{"◐"}</span>
      {label}
    </button>
  );
}
