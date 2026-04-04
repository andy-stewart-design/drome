import BaseCycle from "./base-cycle";
import type { Cycle } from "./utils/types";
import {
  getSeed,
  seedToRand,
  xorwise,
  floatMapper,
  intMapper,
  binaryMapper,
  quantizeMapper,
  type RandMapper,
} from "./utils/random";

interface RandomCycleOptions {
  seed?: number;
  loop?: number | number[];
}

class RandomCycle extends BaseCycle<number> {
  private _seed: number;
  private _loopLengths: number[] | undefined;
  private _totalPeriod: number | undefined;
  private _rangeStart = 0;
  private _rangeEnd = 1;
  private _mapper: RandMapper = floatMapper;

  constructor(opts: RandomCycleOptions = {}) {
    super([[1]], 0);
    this._seed = opts.seed ?? 0;

    if (opts.loop !== undefined) {
      this._loopLengths = Array.isArray(opts.loop) ? opts.loop : [opts.loop];
      this._totalPeriod = this._loopLengths.reduce((a, b) => a + b, 0);
    }
  }

  private getLocalIndex(i: number): number {
    if (!this._loopLengths || !this._totalPeriod) return i;

    const position = i % this._totalPeriod;
    let accumulated = 0;

    for (const len of this._loopLengths) {
      if (position < accumulated + len) {
        return position - accumulated;
      }
      accumulated += len;
    }

    return 0;
  }

  private generate(i: number): number[] {
    const localIndex = this.getLocalIndex(i);
    const mask = this.current[i % this.current.length];

    let seed = getSeed(this._seed + localIndex);
    const result: number[] = [];

    const nullValue = this._nullValue;

    for (const m of mask) {
      if (m === nullValue) {
        result.push(nullValue!);
      } else {
        const rFloat = Math.abs(seedToRand(seed));
        result.push(this._mapper(rFloat, this._rangeStart, this._rangeEnd));
        seed = xorwise(seed);
      }
    }

    return result;
  }

  /* ----------------------------------------------------------------
  /* RANDOM-SPECIFIC METHODS
  ---------------------------------------------------------------- */
  steps(n: number) {
    this._cycle = [Array.from({ length: n }, () => 1)];
    return this;
  }

  range(start: number, end: number) {
    this._rangeStart = start;
    this._rangeEnd = end;
    return this;
  }

  int() {
    this._mapper = intMapper;
    return this;
  }

  bin() {
    this._mapper = binaryMapper;
    return this;
  }

  quant(step: number) {
    this._mapper = quantizeMapper(step);
    return this;
  }

  null(value: number | null) {
    this._nullValue = value as number;
    return this;
  }

  /* ----------------------------------------------------------------
  /* GETTERS
  ---------------------------------------------------------------- */
  at(i: number): Cycle<number>[number];
  at(i: number, j: number): number;
  at(i: number, j?: number) {
    const values = this.generate(i);

    if (typeof j === "number") {
      return values[j % values.length] ?? this._nullValue;
    }

    return values;
  }
}

export default RandomCycle;
