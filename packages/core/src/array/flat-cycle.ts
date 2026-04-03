import { euclid } from "@/utils/euclid";
import { hex } from "@/utils/hex";
import {
  arrange,
  fast,
  pattern,
  stretch,
  reverse,
  sequence,
  slow,
  xox,
  type NoteInput,
  type Cycle,
} from "./cycle-utils";

class FlatCycle<T> {
  private _cycle: Cycle<T>;
  private _nullValue: T | undefined;

  constructor(pattern: NoteInput<T>, nullValue?: T) {
    this._cycle = Array.isArray(pattern) ? [pattern] : [[pattern]];
    this._nullValue = nullValue;
  }

  private applyPattern(type: string, modifier: number[][]) {
    const nullValue = this._nullValue;

    if (nullValue === undefined) {
      const warning = `[FLAT CYCLE] A null value was not set at Cycle creation. Skipping call to ${type}.`;
      console.warn(warning);
      return this._cycle;
    }

    const cycles = this._cycle;
    const loops = Math.max(cycles.length, modifier.length);
    const nextCycles: Cycle<T> = [];

    for (let i = 0; i < loops; i++) {
      let noteIndex = 0;
      const cycle = cycles[i % cycles.length] ?? [];

      const nextCycle = modifier[i % modifier.length].map((p) =>
        p === 0 ? nullValue : cycle[noteIndex++ % cycle.length],
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
    this._cycle = this.applyPattern("euclid", euclid(pulses, steps, rot));
    return this;
  }

  hex(...input: (string | number)[]) {
    this._cycle = this.applyPattern("hex", input.map(hex));
    return this;
  }

  sequence(stepCount: number, ...steps: (number | number[])[]) {
    this._cycle = this.applyPattern("sequence", sequence(stepCount, ...steps));
    return this;
  }

  xox(...steps: (number | number[])[] | string[]) {
    this._cycle = this.applyPattern("xox", xox(...steps));
    return this;
  }

  clear() {
    this._cycle = [];
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

export default FlatCycle;
