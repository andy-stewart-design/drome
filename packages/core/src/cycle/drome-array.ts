class DromeArray<T> {
  protected _value: T[][] = [];
  protected _defaultValue: T[][];

  constructor(defaultValue: T[][]) {
    this._defaultValue = defaultValue;
  }

  /* ----------------------------------------------------------------
  /* PATTERN SETTERS
  ---------------------------------------------------------------- */
  note(...input: (T | T[])[]) {
    this._value = input.map((cycle) =>
      Array.isArray(cycle) ? cycle : [cycle]
    );
    return this;
  }

  reverse() {
    this._value = this._value
      .slice()
      .reverse()
      .map((arr) => arr?.slice().reverse());
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
  fast(multiplier: number) {
    if (multiplier <= 1) return this;
    const length = Math.ceil(this._value.length / multiplier);
    const numLoops = multiplier * length;
    const nextCyles: typeof this._value = Array.from({ length }, () => []);

    for (let i = 0; i < numLoops; i++) {
      const v = this._value[i % this._value.length];
      if (v) nextCyles[Math.floor(i / multiplier)]?.push(...v);
    }

    this._value = nextCyles;
    return this;
  }

  /* ----------------------------------------------------------------
  /* GETTERS
  ---------------------------------------------------------------- */
  at(i: number): T[] | null;
  at(i: number, j: number): NonNullable<T> | null;
  at(i: number, j?: number) {
    const currentValue = this.value[i % this.value.length];
    if (typeof j === "number") {
      return currentValue?.[j % currentValue.length] ?? null;
    }
    return currentValue ?? null;
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
