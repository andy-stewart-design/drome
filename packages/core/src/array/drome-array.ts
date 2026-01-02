class DromeArray<T> {
  protected _value: T[][] = [];
  protected _defaultValue: T[][];
  protected _nullValue: T;

  constructor(...input: (T | T[])[]) {
    const dv = Array.isArray(input[0]) ? input[0][0] : input[0];
    if (dv === undefined) throw new Error("Invalid drome array input");

    this._defaultValue = input.map((c) => (Array.isArray(c) ? c : [c]));
    this._nullValue = dv;
  }

  /* ----------------------------------------------------------------
  /* PATTERN SETTERS
  ---------------------------------------------------------------- */
  note(...input: (T | T[])[]) {
    this._value = input.map((cycle) =>
      Array.isArray(cycle) ? cycle : [cycle],
    );
    return this;
  }

  set defaultValue(value: T[][]) {
    this._defaultValue = value;
  }

  set value(value: T[][]) {
    this._value = value;
  }

  /* ----------------------------------------------------------------
  /* PATTERN MODIFIERS
  ---------------------------------------------------------------- */
  clear() {
    this._value = [];
  }

  fast(n: number) {
    if (n === 1) return this;
    else if (n < 1) {
      this.slow(1 / n);
      return this;
    }

    const length = Math.ceil(this._value.length / n);
    const numLoops = n * length;
    const nextCyles: T[][] = Array.from({ length }, () => []);

    for (let i = 0; i < numLoops; i++) {
      const v = this._value[i % this._value.length];
      if (v) nextCyles[Math.floor(i / n)]?.push(...v);
    }

    this._value = nextCyles;
    return this;
  }

  slow(n: number) {
    if (n === 1) return this;
    else if (n < 1) {
      this.fast(1 / n);
      return this;
    }

    const nextCycles: T[][] = [];

    for (const cycle of this._value) {
      const chunkSize = Math.ceil((cycle.length * n) / n);

      for (let k = 0; k < n; k++) {
        const chunk: T[] = [];
        const startPos = k * chunkSize;
        const endPos = Math.min((k + 1) * chunkSize, cycle.length * n);

        for (let pos = startPos; pos < endPos; pos++) {
          const v = cycle[pos / n];
          if (v && pos % n === 0) chunk.push(v);
          else chunk.push(this._nullValue);
        }

        nextCycles.push(chunk);
      }
    }

    this._value = nextCycles;
    return this;
  }

  stretch(n: number) {
    const foo = this._value.map((cycle) => {
      const length = Math.ceil(n * cycle.length) / cycle.length;
      const nextCyles: T[][] = Array.from({ length }, () => []);

      for (let i = 0; i < cycle.length * length; i++) {
        const beat = cycle[Math.floor(i / n)];
        if (beat) nextCyles[Math.floor(i / cycle.length)]?.push(beat);
      }

      return nextCyles;
    });

    this._value = foo.flat();
    return this;
  }

  reverse() {
    this._value = this._value
      .slice()
      .reverse()
      .map((arr) => arr?.slice().reverse());
    return this;
  }

  /* ----------------------------------------------------------------
  /* GETTERS
  ---------------------------------------------------------------- */
  at(i: number): T[];
  at(i: number, j: number): NonNullable<T>;
  at(i: number, j?: number) {
    const currentValue = this.value[i % this.value.length];
    if (typeof j === "number") {
      return currentValue?.[j % currentValue.length] ?? this._nullValue;
    }
    return currentValue ?? this._nullValue;
  }

  get length() {
    return this.value.length;
  }

  get value() {
    return this._value.length ? this._value : this._defaultValue;
  }

  get rawValue() {
    return this._value;
  }
}

export default DromeArray;
