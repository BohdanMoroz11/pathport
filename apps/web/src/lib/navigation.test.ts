import { describe, expect, it } from "vitest";
import { safeBackHref } from "./navigation";

describe("safeBackHref", () => {
  it("accepts an internal explorer path whose destination matches the route", () => {
    expect(safeBackHref("/explore/USA/DE", "DE")).toBe("/explore/USA/DE");
  });

  it("matches the destination case-insensitively", () => {
    expect(safeBackHref("/explore/usa/de", "DE")).toBe("/explore/usa/de");
  });

  it("rejects a path whose destination does not match the route (no lying back link)", () => {
    expect(safeBackHref("/explore/USA/JP", "DE")).toBeNull();
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(safeBackHref("//evil.com", "DE")).toBeNull();
    expect(safeBackHref("https://evil.com/explore/USA/DE", "DE")).toBeNull();
  });

  it("rejects javascript: and other non-explorer paths", () => {
    expect(safeBackHref("javascript:alert(1)", "DE")).toBeNull();
    expect(safeBackHref("/admin", "DE")).toBeNull();
    expect(safeBackHref("/explore/USA", "DE")).toBeNull();
    expect(safeBackHref("/explore/USA/DE/extra", "DE")).toBeNull();
  });

  it("rejects non-string values", () => {
    expect(safeBackHref(undefined, "DE")).toBeNull();
    expect(safeBackHref(["/explore/USA/DE"], "DE")).toBeNull();
  });
});
