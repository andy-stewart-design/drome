import { describe, expect, it } from "vitest";
import { isNumber } from "./validators";

describe("isNumber", () => {
  it("returns true for integers", () => expect(isNumber(42)).toBe(true));
  it("returns true for floats", () => expect(isNumber(3.14)).toBe(true));
  it("returns true for 0", () => expect(isNumber(0)).toBe(true));
  it("returns true for negative numbers", () => expect(isNumber(-1)).toBe(true));
  it("returns false for NaN", () => expect(isNumber(NaN)).toBe(false));
  it("returns false for strings", () => expect(isNumber("1")).toBe(false));
  it("returns false for null", () => expect(isNumber(null)).toBe(false));
  it("returns false for undefined", () => expect(isNumber(undefined)).toBe(false));
  it("returns false for objects", () => expect(isNumber({})).toBe(false));
  it("returns false for Infinity", () => expect(isNumber(Infinity)).toBe(true)); // Infinity is typeof number and not NaN
});
