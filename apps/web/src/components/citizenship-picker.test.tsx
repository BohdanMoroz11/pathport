import type { Citizenship } from "@pathport/contracts";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CitizenshipPicker } from "./citizenship-picker";

const citizenships: Citizenship[] = [
  { code: "USA", name: "United States", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "UKR", name: "Ukraine", flag: "\u{1F1FA}\u{1F1E6}" },
];

describe("CitizenshipPicker", () => {
  it("links each citizenship to its explorer route", () => {
    render(<CitizenshipPicker citizenships={citizenships} />);

    const usa = screen.getByRole("link", { name: /united states/i });
    expect(usa).toHaveAttribute("href", "/explore/USA");
    expect(screen.getByRole("link", { name: /ukraine/i })).toHaveAttribute("href", "/explore/UKR");
  });

  it("shows an empty state when there are no citizenships", () => {
    render(<CitizenshipPicker citizenships={[]} />);
    expect(screen.getByText(/no citizenships are available/i)).toBeInTheDocument();
  });
});
