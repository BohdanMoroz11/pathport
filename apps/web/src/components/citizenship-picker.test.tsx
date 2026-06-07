import type { Citizenship } from "@pathport/contracts";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CitizenshipPicker } from "./citizenship-picker";

const citizenships: Citizenship[] = [
  { code: "USA", name: "United States" },
  { code: "UKR", name: "Ukraine" },
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
