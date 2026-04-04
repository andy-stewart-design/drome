import { describe, expect, it } from "vitest";
import RandomCycle from "./random-cycle";

describe("RandomCycle", () => {
  describe("basic generation", () => {
    it("returns a single-element array by default", () => {
      const rc = new RandomCycle();
      const result = rc.at(0);
      expect(result).toHaveLength(1);
    });

    it("returns a float between 0 and 1", () => {
      const rc = new RandomCycle();
      const [value] = rc.at(0);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    });

    it("is deterministic — same index produces same value", () => {
      const rc = new RandomCycle();
      expect(rc.at(0)).toEqual(rc.at(0));
      expect(rc.at(5)).toEqual(rc.at(5));
    });

    it("different indices produce different values", () => {
      const rc = new RandomCycle();
      expect(rc.at(0)).not.toEqual(rc.at(1));
    });
  });

  describe("seed", () => {
    it("same seed produces same sequence", () => {
      const a = new RandomCycle({ seed: 42 });
      const b = new RandomCycle({ seed: 42 });
      for (let i = 0; i < 10; i++) {
        expect(a.at(i)).toEqual(b.at(i));
      }
    });

    it("different seeds produce different sequences", () => {
      const a = new RandomCycle({ seed: 1 });
      const b = new RandomCycle({ seed: 2 });
      expect(a.at(0)).not.toEqual(b.at(0));
    });
  });

  describe("at(i, j)", () => {
    it("returns a single value at the given step index", () => {
      const rc = new RandomCycle().steps(4);
      const bar = rc.at(0);
      expect(rc.at(0, 0)).toBe(bar[0]);
      expect(rc.at(0, 1)).toBe(bar[1]);
      expect(rc.at(0, 2)).toBe(bar[2]);
      expect(rc.at(0, 3)).toBe(bar[3]);
    });

    it("wraps j with modulo", () => {
      const rc = new RandomCycle().steps(4);
      expect(rc.at(0, 4)).toBe(rc.at(0, 0));
    });
  });

  describe("steps", () => {
    it("generates n values per bar", () => {
      const rc = new RandomCycle().steps(8);
      expect(rc.at(0)).toHaveLength(8);
    });

    it("is chainable", () => {
      const rc = new RandomCycle();
      expect(rc.steps(4)).toBe(rc);
    });
  });

  describe("range", () => {
    it("maps values to the specified range", () => {
      const rc = new RandomCycle({ seed: 1 }).steps(100).range(200, 800);
      const values = rc.at(0);
      for (const v of values) {
        expect(v).toBeGreaterThanOrEqual(200);
        expect(v).toBeLessThanOrEqual(800);
      }
    });

    it("is chainable", () => {
      const rc = new RandomCycle();
      expect(rc.range(0, 10)).toBe(rc);
    });
  });

  describe("int", () => {
    it("produces integer values", () => {
      const rc = new RandomCycle({ seed: 1 }).steps(50).range(0, 100).int();
      const values = rc.at(0);
      for (const v of values) {
        expect(Number.isInteger(v)).toBe(true);
      }
    });

    it("values are within range", () => {
      const rc = new RandomCycle({ seed: 1 }).steps(50).range(60, 72).int();
      const values = rc.at(0);
      for (const v of values) {
        expect(v).toBeGreaterThanOrEqual(60);
        expect(v).toBeLessThan(72);
      }
    });
  });

  describe("bin", () => {
    it("produces only 0 or 1", () => {
      const rc = new RandomCycle({ seed: 1 }).steps(50).bin();
      const values = rc.at(0);
      for (const v of values) {
        expect(v === 0 || v === 1).toBe(true);
      }
    });
  });

  describe("loop", () => {
    it("single loop length repeats", () => {
      const rc = new RandomCycle({ seed: 1, loop: 4 }).steps(4);
      expect(rc.at(0)).toEqual(rc.at(4));
      expect(rc.at(1)).toEqual(rc.at(5));
      expect(rc.at(2)).toEqual(rc.at(6));
      expect(rc.at(3)).toEqual(rc.at(7));
    });

    it("no loop means unique values", () => {
      const rc = new RandomCycle({ seed: 1 });
      const seen = new Set<string>();
      for (let i = 0; i < 100; i++) {
        seen.add(JSON.stringify(rc.at(i)));
      }
      expect(seen.size).toBe(100);
    });

    it("alternating loop lengths repeat at total period", () => {
      const rc = new RandomCycle({ seed: 1, loop: [2, 4] }).steps(4);
      // total period = 6
      expect(rc.at(0)).toEqual(rc.at(6));
      expect(rc.at(1)).toEqual(rc.at(7));
      expect(rc.at(2)).toEqual(rc.at(8));
      expect(rc.at(5)).toEqual(rc.at(11));
    });

    it("alternating loops have correct segment boundaries", () => {
      const rc = new RandomCycle({ seed: 1, loop: [2, 4] }).steps(4);
      // bar 0 and bar 2 are both local index 0, but in different segments
      // bar 0 = segment 0, local 0
      // bar 2 = segment 1, local 0
      // same local index → same seed derivation → same values
      expect(rc.at(0)).toEqual(rc.at(2));
    });
  });

  describe("pattern modifier composition", () => {
    it("euclid applies mask to random values", () => {
      const rc = new RandomCycle({ seed: 1 }).steps(3).euclid(3, 8);
      const values = rc.at(0);
      expect(values).toHaveLength(8);
      const nonZero = values.filter((v) => v !== 0);
      expect(nonZero).toHaveLength(3);
    });

    it("hex applies mask to random values", () => {
      // hex "9" = [1,0,0,1] — 2 active positions
      const rc = new RandomCycle({ seed: 1 }).steps(2).hex("9");
      const values = rc.at(0);
      expect(values).toHaveLength(4);
      expect(values[1]).toBe(0);
      expect(values[2]).toBe(0);
      expect(values[0]).not.toBe(0);
      expect(values[3]).not.toBe(0);
    });

    it("reverse changes mask positions", () => {
      const rc1 = new RandomCycle({ seed: 1 }).steps(3).euclid(3, 8);
      const rc2 = new RandomCycle({ seed: 1 }).steps(3).euclid(3, 8).reverse();
      const v1 = rc1.at(0);
      const v2 = rc2.at(0);
      // mask is reversed, so null positions flip
      const v1Nulls = v1.map((v) => v === 0);
      const v2Nulls = v2.map((v) => v === 0);
      expect(v2Nulls).toEqual([...v1Nulls].reverse());
      // but both have the same number of active values
      expect(v1.filter((v) => v !== 0)).toHaveLength(3);
      expect(v2.filter((v) => v !== 0)).toHaveLength(3);
    });

    it("default null value (0) is used for masked positions", () => {
      const rc = new RandomCycle({ seed: 1 }).steps(2).euclid(2, 4);
      const values = rc.at(0);
      expect(values).toHaveLength(4);
      const zeroCount = values.filter((v) => v === 0).length;
      expect(zeroCount).toBe(2);
    });

    it("custom null value is used for masked positions", () => {
      const rc = new RandomCycle({ seed: 1 }).steps(2).null(-1).euclid(2, 4);
      const values = rc.at(0);
      const negOneCount = values.filter((v) => v === -1).length;
      expect(negOneCount).toBe(2);
    });
  });
});
