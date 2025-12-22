import DromeArray from "@/array/drome-array";
import { applyAdsr, getAdsrTimes } from "@/utils/adsr.js";
import { parsePatternString } from "@/utils/parse-pattern";
import type { AdsrEnvelope, AdsrMode } from "@/types.js";

class Envelope {
  private _startValue: number;
  private _maxValue: DromeArray<number>;
  private _endValue: number;
  private _adsr: AdsrEnvelope = { a: 0.01, d: 0, s: 1, r: 0.01 };
  private _mode: AdsrMode = "fit";

  constructor(start: number, max: number | string, end?: number) {
    this._startValue = start;
    const mv = typeof max === "number" ? [max] : parsePatternString(max);
    this._maxValue = new DromeArray(...mv);
    this._endValue = end ?? start;
  }

  mode(mode: AdsrMode) {
    this._mode = mode;
    return this;
  }

  adsr(a: number, d?: number, s?: number, r?: number) {
    this._adsr.a = a;
    if (typeof d === "number") this._adsr.d = d;
    if (typeof s === "number") this._adsr.s = s;
    if (typeof r === "number") this._adsr.r = r;
    return this;
  }

  att(v: number) {
    this._adsr.a = v;
    return this;
  }

  dec(v: number) {
    this._adsr.d = v;
    return this;
  }

  sus(v: number) {
    this._adsr.s = v;
    return this;
  }

  rel(v: number) {
    this._adsr.r = v;
    return this;
  }

  maxValue(...v: (number | number[])[]) {
    return this._maxValue.note(...v);
  }

  apply(
    target: AudioParam,
    startTime: number,
    duration: number,
    cycleIndex: number,
    chordIndex: number
  ) {
    const envTimes = getAdsrTimes({
      a: this._adsr.a,
      d: this._adsr.d,
      r: this._adsr.r,
      duration,
      mode: this._mode,
    });

    const maxValue = this._maxValue.at(cycleIndex, chordIndex);

    applyAdsr({
      target,
      startTime,
      startValue: this._startValue,
      envTimes,
      maxValue,
      sustainValue: maxValue * this._adsr.s,
      endValue: this._endValue,
    });

    return envTimes.r.end;
  }

  get startValue() {
    return this._startValue;
  }

  set endValue(v: number) {
    this._endValue = v;
  }

  get a() {
    return this._adsr.a;
  }

  get d() {
    return this._adsr.d;
  }

  get s() {
    return this._adsr.s;
  }

  get r() {
    return this._adsr.r;
  }
}

export default Envelope;
