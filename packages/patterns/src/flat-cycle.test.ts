import { describe, expect, it, vi } from "vitest";
import FlatCycle from "./flat-cycle";

describe("FlatCycle", () => {
  describe("constructor", () => {
    it("wraps a single value into [[value]]", () => {
      const cycle = new FlatCycle(5);
      expect(cycle.current).toEqual([[5]]);
    });

    it("wraps an array into [array]", () => {
      const cycle = new FlatCycle([1, 2, 3]);
      expect(cycle.current).toEqual([[1, 2, 3]]);
    });
  });

  describe("pattern", () => {
    it("sets the cycle and returns this for chaining", () => {
      const cycle = new FlatCycle(0);
      const result = cycle.pattern([1, 2], [3, 4]);
      expect(result).toBe(cycle);
      expect(cycle.current).toEqual([[1, 2], [3, 4]]);
    });

    it("wraps single values in arrays", () => {
      const cycle = new FlatCycle(0);
      cycle.pattern(1, 2);
      expect(cycle.current).toEqual([[1], [2]]);
    });
  });

  describe("arrange", () => {
    it("sets the cycle from [count, pattern] pairs", () => {
      const cycle = new FlatCycle(0);
      const result = cycle.arrange([2, [1, 2]], [1, [3]]);
      expect(result).toBe(cycle);
      expect(cycle.current).toEqual([[1, 2], [1, 2], [3]]);
    });
  });

  describe("replace", () => {
    it("directly sets the cycle", () => {
      const cycle = new FlatCycle(0);
      cycle.replace([[10, 20], [30]]);
      expect(cycle.current).toEqual([[10, 20], [30]]);
    });
  });

  describe("stretch", () => {
    it("repeats and expands the cycle", () => {
      const cycle = new FlatCycle([1, 2]);
      const result = cycle.stretch(2);
      expect(result).toBe(cycle);
      expect(cycle.current).toEqual([[1, 2], [1, 2]]);
    });
  });

  describe("reverse", () => {
    it("reverses the cycle", () => {
      const cycle = new FlatCycle(0);
      cycle.pattern([1, 2], [3, 4]);
      const result = cycle.reverse();
      expect(result).toBe(cycle);
      expect(cycle.current).toEqual([[4, 3], [2, 1]]);
    });
  });

  describe("fast", () => {
    it("compresses the cycle and returns this", () => {
      const cycle = new FlatCycle(0, 0);
      cycle.pattern([1], [2], [3], [4]);
      const result = cycle.fast(2);
      expect(result).toBe(cycle);
      expect(cycle.current).toEqual([[1, 2], [3, 4]]);
    });

    it("returns this unchanged when nullValue is undefined", () => {
      const cycle = new FlatCycle([1, 2]);
      cycle.fast(2);
      expect(cycle.current).toEqual([[1, 2]]);
    });

    it("returns this unchanged when mult is 1", () => {
      const cycle = new FlatCycle([1, 2], 0);
      cycle.fast(1);
      expect(cycle.current).toEqual([[1, 2]]);
    });
  });

  describe("slow", () => {
    it("expands the cycle with null values and returns this", () => {
      const cycle = new FlatCycle([1, 2], 0);
      const result = cycle.slow(2);
      expect(result).toBe(cycle);
      expect(cycle.current).toEqual([[1, 0], [2, 0]]);
    });

    it("returns this unchanged when nullValue is undefined", () => {
      const cycle = new FlatCycle([1, 2]);
      cycle.slow(2);
      expect(cycle.current).toEqual([[1, 2]]);
    });
  });

  describe("euclid", () => {
    it("applies a euclidean pattern to the cycle", () => {
      const cycle = new FlatCycle([1, 2, 3], 0);
      cycle.euclid(2, 4);
      expect(cycle.current).toEqual([[1, 0, 2, 0]]);
    });

    it("warns and skips when nullValue is not set", () => {
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const cycle = new FlatCycle([1, 2, 3]);
      cycle.euclid(2, 4);
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("hex", () => {
    it("applies a hex pattern to the cycle", () => {
      const cycle = new FlatCycle([1, 2, 3, 4], 0);
      cycle.hex("9");
      expect(cycle.current).toEqual([[1, 0, 0, 2]]);
    });
  });

  describe("sequence", () => {
    it("applies a sequence pattern to the cycle", () => {
      const cycle = new FlatCycle([1, 2], 0);
      cycle.sequence(4, [0, 2]);
      expect(cycle.current).toEqual([[1, 0, 2, 0]]);
    });
  });

  describe("xox", () => {
    it("applies an xox pattern to the cycle", () => {
      const cycle = new FlatCycle([1, 2], 0);
      cycle.xox("xoxo");
      expect(cycle.current).toEqual([[1, 0, 2, 0]]);
    });
  });

  describe("clear", () => {
    it("empties the cycle", () => {
      const cycle = new FlatCycle([1, 2, 3]);
      cycle.clear();
      expect(cycle.current).toEqual([]);
      expect(cycle.length).toBe(0);
    });
  });

  describe("at", () => {
    it("returns the pattern at the given index", () => {
      const cycle = new FlatCycle(0);
      cycle.pattern([1, 2], [3, 4]);
      expect(cycle.at(0)).toEqual([1, 2]);
      expect(cycle.at(1)).toEqual([3, 4]);
    });

    it("wraps around with modulo", () => {
      const cycle = new FlatCycle(0);
      cycle.pattern([1, 2], [3, 4]);
      expect(cycle.at(2)).toEqual([1, 2]);
    });

    it("returns element at (i, j) with two arguments", () => {
      const cycle = new FlatCycle(0);
      cycle.pattern([10, 20, 30]);
      expect(cycle.at(0, 1)).toBe(20);
    });

    it("wraps j index with modulo", () => {
      const cycle = new FlatCycle(0);
      cycle.pattern([10, 20]);
      expect(cycle.at(0, 2)).toBe(10);
    });

    it("falls back to nullValue for missing elements", () => {
      const cycle = new FlatCycle(0, -1);
      cycle.clear();
      expect(cycle.at(0, 0)).toBe(-1);
    });
  });

  describe("length", () => {
    it("returns the number of patterns in the cycle", () => {
      const cycle = new FlatCycle(0);
      cycle.pattern([1], [2], [3]);
      expect(cycle.length).toBe(3);
    });
  });

  describe("chaining", () => {
    it("supports method chaining", () => {
      const cycle = new FlatCycle(0, 0);
      cycle.pattern([1, 2], [3, 4]).stretch(2).reverse();
      expect(cycle.length).toBe(4);
    });
  });
});
