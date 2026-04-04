import { describe, expect, it, vi } from "vitest";
import NestedCycle from "./nested-cycle";

describe("NestedCycle", () => {
  describe("constructor", () => {
    it("wraps a single value into [[value]]", () => {
      const cycle = new NestedCycle(5);
      expect(cycle.current).toEqual([[5]]);
    });

    it("wraps an array into [array]", () => {
      const cycle = new NestedCycle([1, [2, 3]]);
      expect(cycle.current).toEqual([[1, [2, 3]]]);
    });
  });

  describe("pattern", () => {
    it("sets the cycle and returns this", () => {
      const cycle = new NestedCycle(0);
      const result = cycle.pattern([1, [2, 3]], [4]);
      expect(result).toBe(cycle);
      expect(cycle.current).toEqual([[1, [2, 3]], [4]]);
    });
  });

  describe("arrange", () => {
    it("sets the cycle from [count, pattern] pairs", () => {
      const cycle = new NestedCycle(0);
      cycle.arrange([2, [1, [2, 3]]]);
      expect(cycle.current).toEqual([[1, [2, 3]], [1, [2, 3]]]);
    });
  });

  describe("replace", () => {
    it("directly sets the cycle", () => {
      const cycle = new NestedCycle(0);
      cycle.replace([[10, [20]], [30]]);
      expect(cycle.current).toEqual([[10, [20]], [30]]);
    });
  });

  describe("stretch", () => {
    it("repeats the cycle", () => {
      const cycle = new NestedCycle([1, [2, 3]]);
      const result = cycle.stretch(2);
      expect(result).toBe(cycle);
      expect(cycle.current).toEqual([[1, [2, 3]], [1, [2, 3]]]);
    });
  });

  describe("reverse", () => {
    it("reverses the cycle and inner patterns", () => {
      const cycle = new NestedCycle(0);
      cycle.pattern([1, 2], [3, 4]);
      cycle.reverse();
      expect(cycle.current).toEqual([[4, 3], [2, 1]]);
    });
  });

  describe("fast", () => {
    it("compresses the cycle", () => {
      const cycle = new NestedCycle(0, 0);
      cycle.pattern([1], [2], [3], [4]);
      cycle.fast(2);
      expect(cycle.current).toEqual([[1, 2], [3, 4]]);
    });

    it("returns this unchanged when nullValue is undefined", () => {
      const cycle = new NestedCycle([1, 2]);
      cycle.fast(2);
      expect(cycle.current).toEqual([[1, 2]]);
    });
  });

  describe("slow", () => {
    it("expands the cycle with null values", () => {
      const cycle = new NestedCycle([1, 2], 0);
      cycle.slow(2);
      expect(cycle.current).toEqual([[1, 0], [2, 0]]);
    });
  });

  describe("euclid", () => {
    it("applies a euclidean pattern", () => {
      const cycle = new NestedCycle([1, 2, 3], 0);
      cycle.euclid(2, 4);
      expect(cycle.current).toEqual([[1, 0, 2, 0]]);
    });

    it("warns when nullValue is not set", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const cycle = new NestedCycle([1, 2]);
      cycle.euclid(2, 4);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("hex", () => {
    it("applies a hex pattern", () => {
      const cycle = new NestedCycle([1, 2, 3, 4], 0);
      cycle.hex("9");
      expect(cycle.current).toEqual([[1, 0, 0, 2]]);
    });
  });

  describe("sequence", () => {
    it("applies a sequence pattern", () => {
      const cycle = new NestedCycle([1, 2], 0);
      cycle.sequence(4, [0, 2]);
      expect(cycle.current).toEqual([[1, 0, 2, 0]]);
    });
  });

  describe("xox", () => {
    it("applies an xox pattern", () => {
      const cycle = new NestedCycle([1, 2], 0);
      cycle.xox("xoxo");
      expect(cycle.current).toEqual([[1, 0, 2, 0]]);
    });
  });

  describe("clear", () => {
    it("empties the cycle", () => {
      const cycle = new NestedCycle([1, 2, 3]);
      cycle.clear();
      expect(cycle.current).toEqual([]);
    });
  });

  describe("at", () => {
    it("returns the pattern at the given index", () => {
      const cycle = new NestedCycle(0);
      cycle.pattern([1, [2, 3]], [4]);
      expect(cycle.at(0)).toEqual([1, [2, 3]]);
    });

    it("wraps around with modulo", () => {
      const cycle = new NestedCycle(0);
      cycle.pattern([1], [2]);
      expect(cycle.at(2)).toEqual([1]);
    });

    it("returns element at (i, j)", () => {
      const cycle = new NestedCycle(0);
      cycle.pattern([10, [20, 30]]);
      expect(cycle.at(0, 1)).toEqual([20, 30]);
    });

    it("falls back to nullValue for missing elements", () => {
      const cycle = new NestedCycle(0, -1);
      cycle.clear();
      expect(cycle.at(0, 0)).toBe(-1);
    });
  });

  describe("nested array elements", () => {
    it("preserves nested arrays through pattern operations", () => {
      const cycle = new NestedCycle(0);
      cycle.pattern([1, [2, 3]], [[4, 5], 6]);
      expect(cycle.current).toEqual([[1, [2, 3]], [[4, 5], 6]]);
      cycle.reverse();
      expect(cycle.current).toEqual([[6, [4, 5]], [[2, 3], 1]]);
    });
  });

  describe("chaining", () => {
    it("supports method chaining", () => {
      const cycle = new NestedCycle(0, 0);
      cycle.pattern([1, 2], [3, 4]).stretch(2).reverse();
      expect(cycle.length).toBe(4);
    });
  });
});
