import { euclid } from "@/utils/euclid";
import { hex } from "@/utils/hex";
import {
  type NoteInput,
  type Cycle,
  pattern,
  arrange,
  stretch,
  reverse,
  fast,
  slow,
  sequence,
  xox,
} from "./test-utils";

// type Nullable<T> = T | null | undefined;

class FlatCycle<T> {
  private _cycle: Cycle<T>;
  private _nullValue: T;

  constructor(pattern: NoteInput<T>, nullValue: T) {
    this._cycle = Array.isArray(pattern) ? [pattern] : [[pattern]];
    this._nullValue = nullValue;
  }

  private applyPattern(modifier: number[][]) {
    const cycles = this._cycle;
    const loops = Math.max(cycles.length, modifier.length);
    const nextCycles: Cycle<T> = [];

    for (let i = 0; i < loops; i++) {
      let noteIndex = 0;
      const cycle = cycles[i % cycles.length] ?? [];

      const nextCycle = modifier[i % modifier.length].map((p) =>
        p === 0 ? this._nullValue : cycle[noteIndex++ % cycle.length],
      );

      nextCycles.push(nextCycle);
    }

    return nextCycles;
  }

  /* ----------------------------------------------------------------
  /* PATTERN SETTERS
  ---------------------------------------------------------------- */
  pattern(...patterns: NoteInput<T>[]) {
    this._cycle = pattern(...patterns);
    return this;
  }

  arrange(...input: [number, NoteInput<T>][]) {
    this._cycle = arrange(...input);
    return this;
  }

  /* ----------------------------------------------------------------
  /* PATTERN MODIFIERS
  ---------------------------------------------------------------- */
  stretch(bars: number, steps = 1) {
    this._cycle = stretch(this._cycle, bars, steps);
    return this;
  }

  reverse() {
    this._cycle = reverse(this._cycle);
    return this;
  }

  fast(mult: number) {
    const nextCycle = fast(this._cycle, this._nullValue, mult);
    if (!nextCycle) return this;
    this._cycle = nextCycle;
    return this;
  }

  slow(mult: number) {
    const nextCycle = slow(this._cycle, this._nullValue, mult);
    if (!nextCycle) return this;
    this._cycle = nextCycle;
    return this;
  }

  euclid(pulses: number | number[], steps: number, rot?: number | number[]) {
    this._cycle = this.applyPattern(euclid(pulses, steps, rot));
    return this;
  }

  hex(...input: (string | number)[]) {
    this._cycle = this.applyPattern(input.map(hex));
    return this;
  }

  sequence(stepCount: number, ...steps: (number | number[])[]) {
    this._cycle = this.applyPattern(sequence(stepCount, ...steps));
    return this;
  }

  xox(...steps: (number | number[])[] | string[]) {
    this._cycle = this.applyPattern(xox(...steps));
    return this;
  }

  /* ----------------------------------------------------------------
    /* GETTERS
    ---------------------------------------------------------------- */
  at(i: number): Cycle<T>[number];
  at(i: number, j: number): T;
  at(i: number, j?: number) {
    const currentValue = this.current[i % this.current.length];

    if (typeof j === "number") {
      return currentValue?.[j % currentValue.length] ?? this._nullValue;
    }

    return currentValue ?? [this._nullValue];
  }

  get length() {
    return this._cycle.length;
  }

  get current() {
    return this._cycle;
  }
}

// const myCycles = new CycleArray<number>(60, 0);
// myCycles.pattern([0, 4, 2, 0], 0);
// const cycles = myCycles.current;
// console.log(cycles);
// const pat = myCycles.at(0);
// console.log(pat);
// const scheduledValue = myCycles.at(0, 0);
// console.log(scheduledValue);

// const myCycles2 = new CycleArray<Nullable<number>>([60, null], 0);
// console.log(myCycles2);

export default FlatCycle;
