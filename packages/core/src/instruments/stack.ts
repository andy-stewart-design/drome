import type Sample from "@/instruments/sample";
import type Synth from "@/instruments/synth";

class DromeStack {
  private _instruments: Set<Sample | Synth>;

  constructor(inst: (Synth | Sample)[]) {
    this._instruments = new Set(inst);
  }

  adsr(a: number, d?: number, s?: number, r?: number) {
    this._instruments.forEach((inst) => inst.adsr(a, d, s, r));
    return this;
  }

  push() {
    this._instruments.forEach((inst) => inst.push());
    return this;
  }

  destroy() {
    this._instruments.clear();
  }
}
