import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Dialog, DialogContent } from "./dialog";

describe("DialogContent", () => {
  it("renders title, description, and children when open", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent title="Compare destinations" description="Pick up to three.">
          <p>Body content</p>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Compare destinations" })).toBeInTheDocument();
    expect(screen.getByText("Pick up to three.")).toBeInTheDocument();
    expect(screen.getByText("Body content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("omits the description when none is given", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent title="Plain">
          <p>Just a body</p>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByRole("heading", { name: "Plain" })).toBeInTheDocument();
    expect(screen.getByText("Just a body")).toBeInTheDocument();
  });
});
