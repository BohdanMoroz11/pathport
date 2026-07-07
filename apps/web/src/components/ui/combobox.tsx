"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "./cn";

/**
 * One selectable row: a label to match/show, an optional emoji glyph and a short
 * hint (e.g. the country code), and the internal href to jump to on select.
 */
export type ComboboxItem = {
  value: string;
  label: string;
  href: string;
  glyph?: string | null;
  hint?: string;
};

type ComboboxProps = {
  items: ComboboxItem[];
  /** Accessible name for the field; rendered visibly unless `hideLabel`. */
  label: string;
  hideLabel?: boolean;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  /** `rail` themes the input for the dark left rail; the popover stays elevated. */
  variant?: "surface" | "rail";
};

/** Input theming: on the content canvas vs. on the always-dark left rail. */
const INPUT_VARIANT = {
  surface:
    "border-(--border) bg-(--surface) text-(--text) placeholder:text-(--text-3) focus-visible:outline-(--brand)",
  rail: "border-(--rail-border) bg-(--rail-bg-2) text-(--rail-text) placeholder:text-(--rail-text-2) focus-visible:outline-(--violet)",
} as const;

/** Case-insensitive substring match on the label and the hint (the code). */
function matches(item: ComboboxItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === "") return true;
  return item.label.toLowerCase().includes(q) || (item.hint?.toLowerCase().includes(q) ?? false);
}

/**
 * A searchable quick-jump built to the WAI-ARIA combobox pattern (Radix ships no
 * combobox primitive, so the ARIA is hand-rolled): DOM focus stays on the input
 * and `aria-activedescendant` points at the highlighted option. Selecting a row
 * navigates to its href. It is a progressive enhancement over the scannable card
 * grid it sits above — that grid is the real, no-JS accessible path.
 */
export function Combobox({
  items,
  label,
  hideLabel = false,
  placeholder = "Search…",
  emptyMessage = "No matches.",
  className,
  variant = "surface",
}: ComboboxProps) {
  const router = useRouter();
  const baseId = useId();
  const listId = `${baseId}-list`;
  const inputId = `${baseId}-input`;
  const optionId = (index: number) => `${baseId}-opt-${index}`;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => items.filter((item) => matches(item, query)), [items, query]);

  // Keep the active index in range as the result set shrinks/grows.
  useEffect(() => {
    setActive((current) => (current >= results.length ? 0 : current));
  }, [results.length]);

  // Close when focus/click leaves the widget.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function select(item: ComboboxItem | undefined) {
    if (!item) return;
    setOpen(false);
    router.push(item.href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setOpen(true);
        setActive((i) => (results.length === 0 ? 0 : (i + 1) % results.length));
        break;
      case "ArrowUp":
        event.preventDefault();
        setOpen(true);
        setActive((i) => (results.length === 0 ? 0 : (i - 1 + results.length) % results.length));
        break;
      case "Home":
        if (open) {
          event.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          event.preventDefault();
          setActive(Math.max(0, results.length - 1));
        }
        break;
      case "Enter":
        if (open) {
          event.preventDefault();
          select(results[active]);
        }
        break;
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        } else if (query !== "") {
          setQuery("");
        }
        break;
    }
  }

  const listVisible = open && results.length > 0;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <label
        htmlFor={inputId}
        className={cn("mb-1.5 block text-sm font-medium text-(--text-2)", hideLabel && "sr-only")}
      >
        {label}
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2",
            variant === "rail" ? "text-(--rail-text-2)" : "text-(--text-3)",
          )}
        >
          {"\u{1F50D}"}
        </span>
        <input
          id={inputId}
          type="text"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={listVisible ? optionId(active) : undefined}
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            "h-10 w-full rounded-[var(--radius-md)] border pl-9 pr-3 text-sm",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
            INPUT_VARIANT[variant],
          )}
        />
      </div>

      {/* The listbox is always in the DOM (empty when closed) so aria-controls
          resolves; visibility is toggled by content, not unmounting. Div-based
          listbox/option is the conventional combobox markup — a ul/li would carry
          implicit non-interactive roles that conflict with the ARIA roles. */}
      <div
        id={listId}
        role="listbox"
        aria-label={label}
        className={cn(
          "absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-[var(--radius-md)] border border-(--border) bg-(--surface) py-1 shadow-[var(--shadow)]",
          !listVisible && "hidden",
        )}
      >
        {results.map((item, index) => (
          // biome-ignore lint/a11y/useFocusableInteractive: options are intentionally not focusable — the input keeps focus and tracks them via aria-activedescendant.
          // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard selection is handled on the input (Enter on the active option), not per-option.
          <div
            key={item.value}
            id={optionId(index)}
            role="option"
            aria-selected={index === active}
            onPointerMove={() => setActive(index)}
            // Select on click; the input's blur must not fire first, so prevent it.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => select(item)}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm",
              index === active ? "bg-(--surface-2) text-(--text)" : "text-(--text-2)",
            )}
          >
            {item.glyph && (
              <span aria-hidden="true" className="text-base">
                {item.glyph}
              </span>
            )}
            <span className="min-w-0 flex-1 truncate font-medium text-(--text)">{item.label}</span>
            {item.hint && (
              <span className="shrink-0 font-display text-xs text-(--text-2)">{item.hint}</span>
            )}
          </div>
        ))}
      </div>

      {open && results.length === 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-[var(--radius-md)] border border-(--border) bg-(--surface) px-3 py-2.5 text-sm text-(--text-2) shadow-[var(--shadow)]">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
