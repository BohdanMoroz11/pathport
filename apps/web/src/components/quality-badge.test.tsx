import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { QualityLabel } from "@/lib/quality";
import { QualityBadges } from "./quality-badge";

const label = (overrides: Partial<QualityLabel> = {}): QualityLabel => ({
  label: "Demo",
  tone: "demo",
  description: "Placeholder demo data.",
  ...overrides,
});

describe("QualityBadges", () => {
  it("renders a labelled list of badges with their descriptions", () => {
    render(
      <QualityBadges
        labels={[label(), label({ label: "Estimate", tone: "estimate", description: "Rough." })]}
      />,
    );

    expect(screen.getByRole("list", { name: /content quality/i })).toBeInTheDocument();
    expect(screen.getByText("Demo")).toHaveAttribute("title", "Placeholder demo data.");
    expect(screen.getByText("Estimate")).toBeInTheDocument();
  });

  it("renders nothing when there are no labels", () => {
    const { container } = render(<QualityBadges labels={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
