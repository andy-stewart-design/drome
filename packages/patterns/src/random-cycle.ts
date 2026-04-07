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
  seed?: number | number[];
  loop?: number | number[];
}

class RandomCycle extends BaseCycle<number> {
  private _baseSeed: number;
  private _segments: Array<{ seed: number; len: number }> | undefined;
  private _totalPeriod: number | undefined;
  private _rangeStart = 0;
  private _rangeEnd = 1;
  private _mapper: RandMapper = floatMapper;
  private _algo: RandAlgo = "xor";

  constructor(opts: RandomCycleOptions = {}) {
    super([[1]], 0);
    const seeds = Array.isArray(opts.seed) ? opts.seed : [opts.seed ?? 0];
    this._baseSeed = seeds[0];

    if (opts.loop !== undefined) {
      const lengths = Array.isArray(opts.loop) ? opts.loop : [opts.loop];
      const count = Math.max(seeds.length, lengths.length);
      this._segments = Array.from({ length: count }, (_, i) => ({
        seed: seeds[i % seeds.length],
        len: lengths[i % lengths.length],
      }));
      this._totalPeriod = this._segments.reduce((a, s) => a + s.len, 0);
    }
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

    const result: number[] = [];
    const mask = this._cycle[barIndex % this._cycle.length];

    for (const m of mask) {
      if (m === this._nullValue) {
        result.push(this._nullValue!);
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
