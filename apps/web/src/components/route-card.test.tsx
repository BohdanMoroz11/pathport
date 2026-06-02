import type { RouteSummary } from "@pathport/contracts";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RouteCard } from "./route-card";

const route: RouteSummary = {
  id: "route-1",
  type: "work",
  title: "Skilled Worker Visa",
  summary: "For qualified professionals with a job offer.",
  cost: { min: 75, max: 100, currency: "EUR" },
  timeline: { minMonths: 2, maxMonths: 4 },
  workPermission: "full",
  familyInclusion: true,
  familyInclusionNote: null,
  pathToPermanentResidence: "eventual",
  pathToPermanentResidenceNote: null,
  renewable: true,
  renewableNote: null,
  reviewStatus: "reviewed",
  confidence: "low",
  isDemo: true,
};

describe("RouteCard", () => {
  it("renders the comparable fields, the type, and links to the detail page", () => {
    render(<RouteCard route={route} href="/routes/route-1?from=/explore/USA/DE" />);

    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/routes/route-1?from=/explore/USA/DE",
    );
    expect(screen.getByRole("heading", { name: "Skilled Worker Visa" })).toBeInTheDocument();
    expect(screen.getByText("Work")).toBeInTheDocument();
    expect(screen.getByText("€75 – €100")).toBeInTheDocument();
    expect(screen.getByText("2–4 months")).toBeInTheDocument();
    expect(screen.getByText("Full work rights")).toBeInTheDocument();
  });

  it("derives stacked quality labels from the route metadata", () => {
    render(<RouteCard route={route} href="/routes/route-1" />);

    // Low confidence + demo, with no sources on a summary card.
    expect(screen.getByText("Estimate")).toBeInTheDocument();
    expect(screen.getByText("Demo")).toBeInTheDocument();
  });
});
