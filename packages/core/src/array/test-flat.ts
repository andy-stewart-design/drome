type Nullable<T> = T | null | undefined;

type NoteInput<T> = T | (T | T[]);

// HELPER FUNCTIONS

function note<T>(...input: NoteInput<T>[]) {
  const value = input.map((cycle) => (Array.isArray(cycle) ? cycle : [cycle]));
  return value;
}

function stretch<T>(arr: T[][], bars: number, steps = 1) {
  bars = Math.round(bars);
  steps = Math.round(steps);

  const nextCycles: T[][] = [];

  for (const cycle of arr) {
    const expanded =
      steps > 1 ? cycle.flatMap((step) => Array(steps).fill(step)) : cycle;
    for (let k = 0; k < Math.max(bars, 1); k++) {
      nextCycles.push([...expanded]);
    }
  }

  return nextCycles;
}

function reverse<T>(arr: T[][]) {
  return arr
    .slice()
    .reverse()
    .map((arr) => arr?.slice().reverse());
}

// MAIN CLASS

class CycleArray<T> {
  protected _value: T[][];

  constructor(...input: NoteInput<T>[]) {
    this._value = input.map((c) => (Array.isArray(c) ? c : [c]));
  }

  note(...input: NoteInput<T>[]) {
    this._value = note(...input);
    return this;
  }

  stretch(bars: number, steps = 1) {
    this._value = stretch(this._value, bars, steps);
    return this;
  }

  reverse() {
    this._value = reverse(this._value);
    return this;
  }

  at(i: number): T[];
  at(i: number, j: number): T;
  at(i: number, j?: number) {
    const currentValue = this.value[i % this.value.length];

    if (typeof j === "number") return currentValue[j];

    return currentValue;
  }

  get value() {
    return this._value;
  }
}

const myCycles = new CycleArray<number>(60);
myCycles.note([0, 4, 2, 0], 0);
const cycles = myCycles.value;
console.log(cycles);
const pattern = myCycles.at(0);
console.log(pattern);
const scheduledValue = myCycles.at(0, 0);
console.log(scheduledValue);
