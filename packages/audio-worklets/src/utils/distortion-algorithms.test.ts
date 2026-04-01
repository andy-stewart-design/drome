import { describe, expect, it } from "vitest";
import {
  asymDiode,
  chebyshev,
  cubic,
  diode,
  fold,
  hardClip,
  sigmoid,
  sineFold,
  softClip,
} from "./distortion-algorithms";

const finiteOutputCases: [number, number][] = [
  [0, 0], [0.5, 1], [-0.5, 1], [1, 5], [-1, 5], [0.1, 50],
];

describe("sigmoid", () => {
  it("returns 0 for x=0", () => expect(sigmoid(0, 1)).toBeCloseTo(0));
  it("preserves sign for positive input", () => expect(sigmoid(0.5, 1)).toBeGreaterThan(0));
  it("preserves sign for negative input", () => expect(sigmoid(-0.5, 1)).toBeLessThan(0));
  it("produces finite output", () => {
    for (const [x, k] of finiteOutputCases) expect(isFinite(sigmoid(x, k))).toBe(true);
  });
  it("increases drive with higher k", () => {
    expect(Math.abs(sigmoid(0.5, 10))).toBeGreaterThan(Math.abs(sigmoid(0.5, 0)));
  });
});

describe("softClip", () => {
  it("returns 0 for x=0", () => expect(softClip(0, 1)).toBeCloseTo(0));
  it("output bounded below 1 for large input", () => expect(softClip(10, 0)).toBeLessThan(1));
  it("output bounded above -1 for large negative input", () => expect(softClip(-10, 0)).toBeGreaterThan(-1));
  it("produces finite output", () => {
    for (const [x, k] of finiteOutputCases) expect(isFinite(softClip(x, k))).toBe(true);
  });
});

describe("hardClip", () => {
  it("returns 0 for x=0", () => expect(hardClip(0, 1)).toBeCloseTo(0));
  it("clips positive values to 1", () => expect(hardClip(10, 1)).toBe(1));
  it("clips negative values to -1", () => expect(hardClip(-10, 1)).toBe(-1));
  it("output never exceeds [-1, 1]", () => {
    for (const [x, k] of finiteOutputCases) {
      const out = hardClip(x, k);
      expect(out).toBeGreaterThanOrEqual(-1);
      expect(out).toBeLessThanOrEqual(1);
    }
  });
});

describe("fold", () => {
  it("returns 0 for x=0, k=0", () => expect(fold(0, 0)).toBeCloseTo(0));
  it("produces finite output", () => {
    for (const [x, k] of finiteOutputCases) expect(isFinite(fold(x, k))).toBe(true);
  });
  it("output in [-1, 1] range", () => {
    for (const [x, k] of finiteOutputCases) {
      const out = fold(x, k);
      expect(out).toBeGreaterThanOrEqual(-1 - 1e-10);
      expect(out).toBeLessThanOrEqual(1 + 1e-10);
    }
  });
});

describe("sineFold", () => {
  it("returns 0 for x=0, k=0", () => expect(sineFold(0, 0)).toBeCloseTo(0));
  it("produces finite output", () => {
    for (const [x, k] of finiteOutputCases) expect(isFinite(sineFold(x, k))).toBe(true);
  });
});

describe("cubic", () => {
  it("returns ~0 for x=0", () => expect(cubic(0, 1)).toBeCloseTo(0));
  it("produces finite output", () => {
    for (const [x, k] of finiteOutputCases) expect(isFinite(cubic(x, k))).toBe(true);
  });
  it("preserves sign", () => {
    expect(cubic(0.3, 1)).toBeGreaterThan(0);
    expect(cubic(-0.3, 1)).toBeLessThan(0);
  });
});

describe("diode", () => {
  it("returns ~0 for x=0, k=0", () => expect(diode(0, 0)).toBeCloseTo(0));
  it("produces finite output", () => {
    for (const [x, k] of finiteOutputCases) expect(isFinite(diode(x, k))).toBe(true);
  });
  it("is symmetric (asym=false default)", () => {
    const pos = diode(0.5, 2);
    const neg = diode(-0.5, 2);
    expect(Math.abs(pos)).toBeCloseTo(Math.abs(neg), 5);
  });
});

describe("asymDiode", () => {
  it("returns ~0 for x=0, k=0", () => expect(asymDiode(0, 0)).toBeCloseTo(0));
  it("produces finite output", () => {
    for (const [x, k] of finiteOutputCases) expect(isFinite(asymDiode(x, k))).toBe(true);
  });
  it("is asymmetric — positive and negative inputs differ", () => {
    const pos = asymDiode(0.5, 2);
    const neg = asymDiode(-0.5, 2);
    expect(Math.abs(pos - neg)).toBeGreaterThan(0.01);
  });
});

describe("chebyshev", () => {
  it("produces finite output", () => {
    for (const [x, k] of finiteOutputCases) expect(isFinite(chebyshev(x, k))).toBe(true);
  });
  it("higher k adds harmonics (larger output magnitude)", () => {
    expect(Math.abs(chebyshev(0.5, 5))).toBeGreaterThan(Math.abs(chebyshev(0.5, 0)));
  });
});
