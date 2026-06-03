import { BadRequestException } from "@nestjs/common";
import { describe, expect, it } from "vitest";
import { CountryCodePipe } from "./country-code.pipe";

describe("CountryCodePipe", () => {
  const pipe = new CountryCodePipe();

  it("normalizes a valid code to upper case", () => {
    expect(pipe.transform("usa")).toBe("USA");
    expect(pipe.transform("de")).toBe("DE");
  });

  it("rejects malformed codes with a 400", () => {
    for (const value of ["", "a", "toolong", "u1", "us-a", "us a"]) {
      expect(() => pipe.transform(value)).toThrow(BadRequestException);
    }
  });
});
