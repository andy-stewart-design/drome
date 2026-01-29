import type Envelope from "@/automation/envelope";
import type Sample from "@/instruments/sample";
import type Synth from "@/instruments/synth";
import type { AdsrMode, SNELO } from "@/types";
import type { FilterTypeAlias } from "@/constants/index";
import type DromeAudioNode from "@/abstracts/drome-audio-node";

class Stack {
  private _instruments: Set<Sample | Synth>;

  // Method Aliases
  dt: (input: number | Envelope | string) => this;
  env: (a: number, d?: number, s?: number, r?: number) => this;
  envMode: (mode: AdsrMode) => this;
  fil: (type: FilterTypeAlias, f: SNELO, q: SNELO) => this;
  fx: (...nodes: DromeAudioNode[]) => this;

  constructor(inst: (Synth | Sample)[]) {
    this._instruments = new Set(inst);

    this.dt = this.detune.bind(this);
    this.env = this.adsr.bind(this);
    this.envMode = this.adsrMode.bind(this);
    this.fil = this.filter.bind(this);
    this.fx = this.effects.bind(this);
  }

  gain(input: number | Envelope | string) {
    this._instruments.forEach((inst) => inst.gain(input));
    return this;
  }

  adsr(a: number, d?: number, s?: number, r?: number) {
    this._instruments.forEach((inst) => inst.adsr(a, d, s, r));
    return this;
  }

  att(v: number) {
    this._instruments.forEach((inst) => inst.att(v));
    return this;
  }

  dec(v: number) {
    this._instruments.forEach((inst) => inst.dec(v));
    return this;
  }

  sus(v: number) {
    this._instruments.forEach((inst) => inst.sus(v));
    return this;
  }

  rel(v: number) {
    this._instruments.forEach((inst) => inst.rel(v));
    return this;
  }

  adsrMode(mode: AdsrMode) {
    this._instruments.forEach((inst) => inst.adsrMode(mode));
    return this;
  }

  detune(input: SNELO) {
    this._instruments.forEach((inst) => inst.detune(input));
    return this;
  }

  filter(type: FilterTypeAlias, f: SNELO, q?: SNELO) {
    this._instruments.forEach((inst) => inst.filter(type, f, q));
    return this;
  }

  effects(...nodes: DromeAudioNode[]) {
    this._instruments.forEach((inst) => inst.effects(...nodes));
    return this;
  }

  push() {
    this._instruments.forEach((inst) => inst.push());
    this.destroy();
  }

  destroy() {
    this._instruments.clear();
  }
}

export default Stack;
