import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders an accessible button", async () => {
    const { container } = render(<Button>Explore</Button>);

    expect(screen.getByRole("button", { name: "Explore" })).toBeInTheDocument();
    await expect(axe(container)).resolves.toHaveNoViolations();
  });
});
