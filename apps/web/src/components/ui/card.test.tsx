import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Card } from "./card";

describe("Card", () => {
  it("renders a static surface with its children", async () => {
    const { container } = render(<Card>Panel body</Card>);

    expect(screen.getByText("Panel body")).toBeInTheDocument();
    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("adds the interactive affordance and stays a single tab stop when asChild", () => {
    render(
      <Card asChild interactive>
        <a href="/somewhere">Open</a>
      </Card>,
    );

    const link = screen.getByRole("link", { name: "Open" });
    // Slot merges the card styling onto the anchor itself (no wrapper element).
    expect(link.className).toContain("hover:border-(--brand)");
    expect(link.className).toContain("focus-visible:outline");
  });
});
