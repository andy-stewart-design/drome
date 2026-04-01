import { describe, expect, it } from "vitest";
import { clamp, map, mod, squash } from "./math";

describe("clamp", () => {
  it("returns min when below range", () => expect(clamp(-5, 0, 10)).toBe(0));
  it("returns max when above range", () => expect(clamp(15, 0, 10)).toBe(10));
  it("returns value when within range", () => expect(clamp(5, 0, 10)).toBe(5));
  it("returns min at lower boundary", () => expect(clamp(0, 0, 10)).toBe(0));
  it("returns max at upper boundary", () => expect(clamp(10, 0, 10)).toBe(10));
  it("handles negative range", () => expect(clamp(-3, -10, -1)).toBe(-3));
});

describe("mod", () => {
  it("positive modulo", () => expect(mod(7, 3)).toBe(1));
  it("returns 0 when evenly divisible", () => expect(mod(6, 3)).toBe(0));
  it("handles negative n correctly", () => expect(mod(-1, 4)).toBe(3));
  it("handles negative n at boundary", () => expect(mod(-4, 4)).toBe(0));
  it("preserves positive values under mod", () => expect(mod(1.5, 1)).toBeCloseTo(0.5));
});

describe("squash", () => {
  it("returns 0 for x=0", () => expect(squash(0)).toBe(0));
  it("returns 0.5 for x=1", () => expect(squash(1)).toBeCloseTo(0.5));
  it("approaches 1 for large x", () => expect(squash(999)).toBeCloseTo(1, 2));
  it("returns negative for negative x", () => expect(squash(-0.5)).toBeLessThan(0));
});

describe("map", () => {
  it("maps midpoint correctly", () => expect(map(5, 0, 10, 0, 100)).toBe(50));
  it("maps min to new min", () => expect(map(0, 0, 127, 0, 1)).toBe(0));
  it("maps max to new max", () => expect(map(127, 0, 127, 0, 1)).toBe(1));
  it("handles inverted output range", () => expect(map(0, 0, 10, 10, 0)).toBe(10));
  it("maps MIDI 64 to ~0.5", () => expect(map(64, 0, 127, 0, 1)).toBeCloseTo(0.504, 2));
});
