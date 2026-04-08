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

class RandomCycle<
  N extends number | null | undefined = number,
> extends BaseCycle<number, number | N> {
  private _outputNullValue: N | undefined;
  private _baseSeed: number = 0;
  private _segments: Array<{ seed: number; len: number }> | undefined;
  private _totalPeriod: number | undefined;
  private _rangeStart = 0;
  private _rangeEnd = 1;
  private _mapper: RandMapper = floatMapper;
  private _algo: RandAlgo = "xor";

  constructor(nullValue?: N) {
    super([[1]], 0);
    this._outputNullValue = nullValue;
  }

  private getSegmentInfo(barIndex: number) {
    if (!this._segments || !this._totalPeriod) {
      return [this._baseSeed, barIndex] as const;
    }

    const position = barIndex % this._totalPeriod;
    let accumulated = 0;

    for (const seg of this._segments) {
      if (position < accumulated + seg.len) {
        return [seg.seed, position - accumulated] as const;
      }
      accumulated += seg.len;
    }

    return [this._segments[0].seed, 0] as const;
  }

  private generate(barIndex: number) {
    const [currentSeed, seedOffset] = this.getSegmentInfo(barIndex);
    let seed = getSeed(currentSeed + seedOffset);

    const result: (number | N)[] = [];
    const mask = this._cycle[barIndex % this._cycle.length];
    const nullOut =
      this._outputNullValue === undefined ? 0 : this._outputNullValue;

    for (const m of mask) {
      if (m === 0) {
        result.push(nullOut as N);
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
  ribbon(seed: number | number[], loop?: number | number[]) {
    const seeds = Array.isArray(seed) ? seed : [seed];
    this._baseSeed = seeds[0];

    if (loop !== undefined) {
      const lengths = Array.isArray(loop) ? loop : [loop];
      const count = Math.max(seeds.length, lengths.length);
      this._segments = Array.from({ length: count }, (_, i) => ({
        seed: seeds[i % seeds.length],
        len: lengths[i % lengths.length],
      }));
      this._totalPeriod = this._segments.reduce((a, s) => a + s.len, 0);
    } else {
      this._segments = undefined;
      this._totalPeriod = undefined;
    }

    return this;
  }

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

  null(value: N) {
    this._outputNullValue = value;
    return this;
  }

  /* ----------------------------------------------------------------
  /* GETTERS
  ---------------------------------------------------------------- */
  at(i: number): Cycle<number | N>[number];
  at(i: number, j: number): number | N;
  at(i: number, j?: number): Cycle<number | N>[number] | (number | N) {
    const values = this.generate(i);

    if (typeof j === "number") {
      return values[j % values.length];
    }

    return values;
  }
}

export default RandomCycle;
