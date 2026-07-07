import { fireEvent, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Combobox, type ComboboxItem } from "./combobox";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const items: ComboboxItem[] = [
  { value: "USA", label: "United States", href: "/explore/USA", glyph: "🇺🇸", hint: "USA" },
  { value: "UKR", label: "Ukraine", href: "/explore/UKR", glyph: "🇺🇦", hint: "UKR" },
  { value: "DEU", label: "Germany", href: "/explore/DEU", glyph: "🇩🇪", hint: "DEU" },
];

function renderCombobox() {
  return render(<Combobox items={items} label="Jump to a citizenship" placeholder="Search…" />);
}

beforeEach(() => {
  push.mockClear();
});

describe("Combobox", () => {
  it("exposes the input as a labelled combobox with no a11y violations", async () => {
    const { container } = renderCombobox();

    const input = screen.getByRole("combobox", { name: "Jump to a citizenship" });
    expect(input).toHaveAttribute("aria-expanded", "false");
    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("filters the options by label as the user types", () => {
    renderCombobox();
    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "ger" } });

    expect(screen.getByRole("option", { name: /Germany/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Ukraine/ })).not.toBeInTheDocument();
  });

  it("navigates to the highlighted option on Enter via the keyboard", () => {
    renderCombobox();
    const input = screen.getByRole("combobox");

    fireEvent.focus(input);
    // On open the top match is pre-highlighted (index 0); one ArrowDown moves to
    // the second option, tracked via aria-activedescendant, not DOM focus.
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(push).toHaveBeenCalledWith("/explore/UKR");
  });

  it("navigates when an option is clicked", () => {
    renderCombobox();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "united" } });

    fireEvent.click(screen.getByRole("option", { name: /United States/ }));

    expect(push).toHaveBeenCalledWith("/explore/USA");
  });

  it("shows the empty message when nothing matches", () => {
    renderCombobox();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "zzz" } });

    expect(screen.getByText("No matches.")).toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });
});
