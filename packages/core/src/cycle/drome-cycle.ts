import DromeArray from "@/cycle/drome-array.js";
import { euclid } from "@/utils/euclid.js";
import { hex } from "@/utils/hex";
import type { DromeCycleValue, Nullable, StepPattern } from "@/types.js";

class DromeCycle<T> extends DromeArray<Nullable<T>> {
  constructor(defaultValue: DromeCycleValue<T>) {
    super(defaultValue);
  }

  /* ----------------------------------------------------------------
  /* PATTERN SETTERS
  ---------------------------------------------------------------- */
  protected applyPattern(patterns: (number | null | undefined)[][]) {
    const cycles = this._value.length ? this._value : this._defaultValue;
    const loops = Math.max(cycles.length, patterns.length);
    const nextCycles: DromeCycleValue<Nullable<T>> = [];

    for (let i = 0; i < loops; i++) {
      let noteIndex = 0;
      const cycle = cycles[i % cycles.length] ?? [];
      const nextCycle =
        patterns[i % patterns.length]?.map((p) =>
          p === 0 ? null : cycle[noteIndex++ % cycle.length]
        ) ?? [];
      nextCycles.push(nextCycle);
    }

    return nextCycles;
  }

  arrange(...input: [number, Nullable<T>[]][]) {
    let nextCycles: Nullable<T>[][] = [];

    for (const [numLoops, pattern] of input) {
      for (let i = 0; i < numLoops; i++) {
        nextCycles.push(pattern);
      }
    }

    this._value = nextCycles;
    return this;
  }

  euclid(
    pulses: number | number[],
    steps: number,
    rotation: number | number[]
  ) {
    console.log(euclid(pulses, steps, rotation));

    this._value = this.applyPattern(euclid(pulses, steps, rotation));
    return this;
  }

  hex(...input: (string | number)[]) {
    this._value = this.applyPattern(input.map(hex));
    return this;
  }

  sequence(steps: number, ...pulses: StepPattern) {
    const pattern = pulses.map((p) =>
      Array.from({ length: steps }, (_, i) => {
        return [p].flat().includes(i) ? 1 : 0;
      })
    );
    this._value = this.applyPattern(pattern);
    return this;
  }

  xox(...input: StepPattern | string[]) {
    const pattern = input.map((c) => {
      if (typeof c === "string") {
        return c.split("").reduce<number[]>((acc, s) => {
          if (s.trim()) acc.push(s.trim() === "x" ? 1 : 0);
          return acc;
        }, []);
      }
      return Array.isArray(c) ? c.map((n) => (n ? 1 : 0)) : c ? [1] : [0];
    });
    this._value = this.applyPattern(pattern);
    return this;
  }
}

export default DromeCycle;
