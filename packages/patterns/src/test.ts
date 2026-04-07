type Nullable<T> = T | null | undefined;

class FlatCycle<S extends number | Nullable<number> = number> {
  private _cycle: (S | null)[][];
  private _nullValue: S;

  constructor(dV: S | S[] | S[][], nV: S) {
    this._cycle = !Array.isArray(dV)
      ? [[dV]]
      : dV.map((v) => (Array.isArray(v) ? v : [v]));
    this._nullValue = nV;
  }

  protected applyPattern(modifier: number[][]) {
    const nullValue = this._nullValue;

    const cycles = this._cycle;
    const loops = Math.max(cycles.length, modifier.length);
    const nextCycles: (S | null)[][] = [];

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

  at(i: number): S[];
  at(i: number, j: number): S;
  at(i: number, j?: number) {
    const currentValue = this._cycle[i % this._cycle.length];

    if (typeof j === "number") {
      return currentValue?.[j % currentValue.length] ?? this._nullValue;
    }

    return currentValue ?? [this._nullValue];
  }
}

const foo = new FlatCycle([0, 9], 0).at(0, 0);
