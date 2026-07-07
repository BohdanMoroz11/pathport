import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders a neutral outline pill by default", async () => {
    const { container } = render(<Badge>Work visa</Badge>);

    const badge = screen.getByText("Work visa");
    expect(badge.className).toContain("border-(--border)");
    await expect(axe(container)).resolves.toHaveNoViolations();
  });

  it("applies the soft tone fill", () => {
    render(
      <Badge variant="soft" tone="pos">
        Official
      </Badge>,
    );
    expect(screen.getByText("Official").className).toContain("bg-(--pos-soft)");
  });

  it("prepends a decorative tone dot when asked", () => {
    render(
      <Badge tone="warn" dot>
        High complexity
      </Badge>,
    );
    // The dot is aria-hidden, so the accessible name stays just the label text.
    const badge = screen.getByText("High complexity");
    expect(badge.querySelector("[aria-hidden='true']")).not.toBeNull();
  });
});
