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

type Nullable<T> = T | null | undefined;

class CycleArrayNested<T> {
  private _cycle: Cycle<T | T[]>;
  private _nullValue: T;

  constructor(pattern: NoteInput<T | T[]>, nullValue: T) {
    this._cycle = Array.isArray(pattern) ? [pattern] : [[pattern]];
    this._nullValue = nullValue;
  }

  private applyPattern(modifier: number[][]) {
    const cycles = this._cycle;
    const loops = Math.max(cycles.length, modifier.length);
    const nextCycles: Cycle<T | T[]> = [];

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
  pattern(...patterns: NoteInput<T | T[]>[]) {
    this._cycle = pattern(...patterns);
    return this;
  }

  arrange(...input: [number, NoteInput<T | T[]>][]) {
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
  at(i: number): Cycle<T | T[]>[number];
  at(i: number, j: number): T | T[];
  at(i: number, j?: number) {
    const currentValue = this.current[i % this.current.length];

    if (typeof j === "number") return currentValue[j];

    return currentValue;
  }

  get length() {
    return this._cycle.length;
  }

  get current() {
    return this._cycle;
  }
}

const myCycles = new CycleArrayNested<Nullable<number>>(60, null);
myCycles.pattern([0, 4, [2, 0]], 0);
console.log(myCycles.current);
