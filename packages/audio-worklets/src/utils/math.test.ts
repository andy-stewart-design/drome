import { describe, expect, it } from "vitest";
import { clamp, mod, squash } from "./math";

describe("clamp", () => {
  it("returns min when below range", () => expect(clamp(-5, 0, 10)).toBe(0));
  it("returns max when above range", () => expect(clamp(15, 0, 10)).toBe(10));
  it("returns value when within range", () => expect(clamp(5, 0, 10)).toBe(5));
  it("handles float boundaries", () => expect(clamp(0.5, 0, 1)).toBe(0.5));
});

describe("mod", () => {
  it("positive modulo", () => expect(mod(7, 3)).toBe(1));
  it("returns 0 when evenly divisible", () => expect(mod(6, 3)).toBe(0));
  it("handles negative n correctly", () => expect(mod(-1, 4)).toBe(3));
  it("handles negative n at boundary", () => expect(mod(-4, 4)).toBe(0));
  it("wraps phase values in [0, 1)", () => expect(mod(1.25, 1)).toBeCloseTo(0.25));
});

describe("squash", () => {
  it("returns 0 for x=0", () => expect(squash(0)).toBe(0));
  it("returns 0.5 for x=1", () => expect(squash(1)).toBeCloseTo(0.5));
  it("approaches 1 for large x", () => expect(squash(9999)).toBeCloseTo(1, 3));
  it("returns negative for negative x", () => expect(squash(-0.5)).toBeLessThan(0));
});
