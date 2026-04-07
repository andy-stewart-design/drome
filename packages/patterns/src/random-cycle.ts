import BaseCycle from "./base-cycle";
import type { Cycle } from "./utils/types";
import {
  getSeed,
  seedToRand,
  xorwise,
  mulberry32,
  floatMapper,
  intMapper,
  binaryMapper,
  quantizeMapper,
  type RandMapper,
  type RandAlgo,
} from "./utils/random";

interface RandomCycleOptions {
  seed?: number;
  loop?: number | number[];
}

class RandomCycle extends BaseCycle<number> {
  private _seed: number;
  private _loopLengths: number[] | undefined;
  private _loopPeriod: number | undefined;
  private _rangeStart = 0;
  private _rangeEnd = 1;
  private _mapper: RandMapper = floatMapper;
  private _algo: RandAlgo = "xor";

  constructor(opts: RandomCycleOptions = {}) {
    super([[1]], 0);
    this._seed = opts.seed ?? 0;

    if (opts.loop !== undefined) {
      this._loopLengths = Array.isArray(opts.loop) ? opts.loop : [opts.loop];
      this._loopPeriod = this._loopLengths.reduce((a, b) => a + b, 0);
    }
  }

  private getSeedOffset(barIndex: number): number {
    if (!this._loopLengths || !this._loopPeriod) return barIndex;

    const position = barIndex % this._loopPeriod;
    let accumulated = 0;

    for (const len of this._loopLengths) {
      if (position < accumulated + len) return position - accumulated;
      else accumulated += len;
    }

    return 0;
  }

  private generate(barIndex: number) {
    const seedOffset = this.getSeedOffset(barIndex);
    const mask = this._cycle[barIndex % this._cycle.length];

    let seed = getSeed(this._seed + seedOffset);
    const result: number[] = [];

    const nullValue = this._nullValue;

    for (const m of mask) {
      if (m === nullValue) {
        result.push(nullValue!);
      } else {
        let rFloat: number;
        if (this._algo === "mulberry") {
          rFloat = mulberry32(seed);
          seed = (seed + 1) | 0;
        } else {
          rFloat = Math.abs(seedToRand(seed));
          seed = xorwise(seed);
        }
        result.push(this._mapper(rFloat, this._rangeStart, this._rangeEnd));
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

  algo(name: RandAlgo) {
    this._algo = name;
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
