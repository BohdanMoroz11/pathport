import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the product positioning", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: /compare realistic migration paths/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Immigration options, structured and source-aware."),
    ).toBeInTheDocument();
  });
});
