import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders an accessible button that defaults to type=button", async () => {
    const { container } = render(<Button>Explore</Button>);

    const button = screen.getByRole("button", { name: "Explore" });
    expect(button).toHaveAttribute("type", "button");
    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("renders as a link (a real anchor) when asChild", () => {
    render(
      <Button asChild variant="secondary">
        <a href="/explore">Browse</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Browse" });
    // Slot merges the button styling onto the anchor — no nested button, no type.
    expect(link).not.toHaveAttribute("type");
    expect(link.className).toContain("border-(--border)");
  });
});
