// TODO: Move applyPattern and associated methods
// euclid(): number[][]
// hex(): number[] **which is then nested**
import { euclid } from "@/utils/euclid";
import { hex } from "@/utils/hex";

type Nullable<T> = T | null | undefined;
type NoteInput<T> = T | (T | T[])[];
type Cycle<T> = (T | T[])[][];

// -----------------------------------------------------------------
// HELPER FUNCTIONS

function pattern<T>(...patterns: NoteInput<T>[]) {
  return patterns.map((p) => (Array.isArray(p) ? p : [p]));
}

function arrange<T>(...patterns: [number, NoteInput<T>][]) {
  let nextCycle: Cycle<T> = [];

  for (const [numLoops, pattern] of patterns) {
    for (let i = 0; i < numLoops; i++) {
      nextCycle.push(Array.isArray(pattern) ? pattern : [pattern]);
    }
  }

  return nextCycle;
}

function stretch<T>(cycle: (T | T[])[][], bars: number, steps = 1) {
  bars = Math.round(bars);
  steps = Math.round(steps);

  const nextCycle: T[][] = [];

  for (const pattern of cycle) {
    const expanded =
      steps > 1 ? pattern.flatMap((step) => Array(steps).fill(step)) : pattern;
    for (let k = 0; k < Math.max(bars, 1); k++) {
      nextCycle.push([...expanded]);
    }
  }

  return nextCycle;
}

function reverse<T>(cycle: Cycle<T>) {
  return cycle
    .slice()
    .reverse()
    .map((arr) => arr?.slice().reverse());
}

function fast<T>(cycle: Cycle<T>, nullVal: T, mult: number): Cycle<T> | null {
  mult = Math.round(mult);
  if (mult === 1) return null;
  else if (mult < 1) return slow(cycle, nullVal, 1 / mult);

  const length = Math.ceil(cycle.length / mult);
  const numLoops = mult * length;
  const nextCyle: Cycle<T> = Array.from({ length }, () => []);

  for (let i = 0; i < numLoops; i++) {
    const v = cycle[i % cycle.length];
    nextCyle[Math.floor(i / mult)].push(...v);
  }

  return nextCyle;
}

function slow<T>(cycle: Cycle<T>, nullVal: T, mult: number): Cycle<T> | null {
  mult = Math.round(mult);
  if (mult === 1) return null;
  else if (mult < 1) return fast(cycle, nullVal, 1 / mult);

  const nextCycle: Cycle<T> = [];

  for (const pat of cycle) {
    const expanded: Cycle<T>[number] = [];
    for (let i = 0; i < pat.length * mult; i++) {
      expanded.push(i % mult === 0 ? pat[i / mult] : nullVal);
    }
    for (let k = 0; k < mult; k++) {
      nextCycle.push(expanded.slice(k * pat.length, (k + 1) * pat.length));
    }
  }

  return nextCycle;
}

function sequence(stepCount: number, ...steps: (number | number[])[]) {
  return steps.map((p) =>
    Array.from({ length: stepCount }, (_, i) => {
      return [p].flat().includes(i) ? 1 : 0;
    }),
  );
}

function xox(...steps: (number | number[])[] | string[]) {
  return steps.map((c) => {
    if (typeof c === "string") {
      return c.split("").reduce<number[]>((acc, s) => {
        if (s.trim()) acc.push(s.trim() === "x" ? 1 : 0);
        return acc;
      }, []);
    }
    return Array.isArray(c) ? c.map((n) => (n ? 1 : 0)) : c ? [1] : [0];
  });
}

// -----------------------------------------------------------------
// MAIN CLASS

class CycleArrayNested<T> {
  private _value: Cycle<T>;
  private _nullValue: T;

  constructor(pattern: NoteInput<T>, nullValue: T) {
    this._value = Array.isArray(pattern) ? [pattern] : [[pattern]];
    this._nullValue = nullValue;
  }

  private applyPattern(modifier: (number | null | undefined)[][]) {
    const cycles = this._value;
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
    this._value = pattern(...patterns);
    return this;
  }

  arrange(...input: [number, NoteInput<T>][]) {
    this._value = arrange(...input);
    return this;
  }

  /* ----------------------------------------------------------------
  /* PATTERN MODIFIERS
  ---------------------------------------------------------------- */
  stretch(bars: number, steps = 1) {
    this._value = stretch(this._value, bars, steps);
    return this;
  }

  reverse() {
    this._value = reverse(this._value);
    return this;
  }

  fast(mult: number) {
    const nextCycle = fast(this._value, this._nullValue, mult);
    if (!nextCycle) return this;
    this._value = nextCycle;
    return this;
  }

  slow(mult: number) {
    const nextCycle = slow(this._value, this._nullValue, mult);
    if (!nextCycle) return this;
    this._value = nextCycle;
    return this;
  }

  euclid(pulses: number | number[], steps: number, rot?: number | number[]) {
    this._value = this.applyPattern(euclid(pulses, steps, rot));
    return this;
  }

  hex(...input: (string | number)[]) {
    this._value = this.applyPattern(input.map(hex));
    return this;
  }

  sequence(stepCount: number, ...steps: (number | number[])[]) {
    this._value = this.applyPattern(sequence(stepCount, ...steps));
    return this;
  }

  xox(...steps: (number | number[])[] | string[]) {
    this._value = this.applyPattern(xox(...steps));
    return this;
  }

  /* ----------------------------------------------------------------
  /* GETTERS
  ---------------------------------------------------------------- */
  at(i: number): Cycle<T>[number];
  at(i: number, j: number): T | T[];
  at(i: number, j?: number) {
    const currentValue = this.value[i % this.value.length];

    if (typeof j === "number") return currentValue[j];

    return currentValue;
  }

  get length() {
    return this._value.length;
  }

  get value() {
    return this._value;
  }
}

const myCycles = new CycleArrayNested<Nullable<number>>(60, null);
myCycles.pattern([0, 4, [2, 0]], 0);
console.log(myCycles.value);
