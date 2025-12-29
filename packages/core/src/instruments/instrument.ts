import AutomatableEffect from "@/abstracts/effect-automatable";
import DromeAudioNode from "@/abstracts/drome-audio-node";
import DromeArrayNullable from "@/array/drome-array-nullable";
import SynthesizerNode from "@/audio-nodes/synthesizer-node";
import SampleNode from "@/audio-nodes/sample-node";
import Envelope from "@/automation/envelope";
import Pattern from "@/automation/pattern";
import { parsePatternString } from "../utils/parse-pattern";
import { isNullish, isNumber, isString } from "../utils/validators";
import type Drome from "../index";
import type {
  AdsrMode,
  AdsrEnvelope,
  InstrumentType,
  Note,
  NSE,
  Nullable,
} from "../types";
import type { FilterType } from "@/worklets/worklet-filter";
import { filterTypeMap, type FilterTypeAlias } from "../constants/index";
import LfoNode from "@/automation/lfo-node";

interface InstrumentOptions<T> {
  destination: AudioNode;
  defaultCycle: T;
  nullValue: T;
  baseGain?: number;
  adsr?: AdsrEnvelope;
}

interface FrequencyParams {
  type: FilterType;
  frequency?: Pattern | Envelope;
  q?: Pattern | Envelope;
}

abstract class Instrument<T> {
  protected _drome: Drome;
  protected _cycles: DromeArrayNullable<T>;
  private _destination: AudioNode;
  protected _connectorNode: GainNode;
  protected readonly _audioNodes: Set<SynthesizerNode | SampleNode>;
  private _signalChain: Set<DromeAudioNode>;
  private _baseGain: number;
  protected _gain: Envelope;
  private _detune: Pattern | Envelope | LfoNode;
  protected _filter: FrequencyParams = { type: "none" };
  protected _startTime: number | undefined;
  private _connected = false;

  // Method Aliases
  amp: (input: number | Envelope | string) => this;
  dt: (input: number | Envelope | string) => this;
  env: (a: number, d?: number, s?: number, r?: number) => this;
  envMode: (mode: AdsrMode) => this;
  fx: (...nodes: DromeAudioNode[]) => this;
  rev: () => this;
  seq: (steps: number, ...pulses: (number | number[])[]) => this;
  fil: (
    type: FilterTypeAlias,
    f: number | Envelope | string,
    q: number | Envelope | string
  ) => this;

  constructor(drome: Drome, opts: InstrumentOptions<T>) {
    this._drome = drome;
    this._cycles = new DromeArrayNullable(opts.defaultCycle);

    this._destination = opts.destination;
    this._connectorNode = new GainNode(drome.ctx);
    this._audioNodes = new Set();
    this._signalChain = new Set();

    this._baseGain = opts.baseGain ?? 0.35;
    this._gain = new Envelope(0, this._baseGain);
    this._detune = new Pattern(0);

    this.amp = this.amplitude.bind(this);
    this.dt = this.detune.bind(this);
    this.env = this.adsr.bind(this);
    this.fx = this.effects.bind(this);
    this.envMode = this.adsrMode.bind(this);
    this.rev = this.reverse.bind(this);
    this.seq = this.sequence.bind(this);
    this.fil = this.filter.bind(this);
  }

  protected applyGain(
    node: SynthesizerNode | SampleNode,
    start: number,
    duration: number,
    chordIndex: number
  ) {
    const cycleIndex = this._drome.metronome.bar % this._cycles.length;
    return this._gain.apply(node.gain, start, duration, cycleIndex, chordIndex);
  }

  protected applyFilter(
    node: SynthesizerNode | SampleNode,
    start: number,
    duration: number,
    chordIndex: number
  ) {
    const cycleIndex = this._drome.metronome.bar % this._cycles.length;

    if (this._filter.frequency) node.setFilterType(this._filter.type);

    if (this._filter.frequency instanceof Pattern) {
      this._filter.frequency.apply(
        node.filterFrequency,
        cycleIndex,
        chordIndex
      );
    } else if (this._filter.frequency instanceof Envelope) {
      this._filter.frequency.apply(
        node.filterFrequency,
        start,
        duration,
        cycleIndex,
        chordIndex
      );
    }

    if (this._filter.q instanceof Pattern) {
      this._filter.q.apply(node.filterQ, cycleIndex, chordIndex);
    } else if (this._filter.q instanceof Envelope) {
      this._filter.q.apply(
        node.filterQ,
        start,
        duration,
        cycleIndex,
        chordIndex
      );
    }
  }

  protected applyDetune(
    node: SynthesizerNode | SampleNode,
    start: number,
    duration: number,
    chordIndex: number
  ) {
    const cycleIndex = this._drome.metronome.bar % this._cycles.length;

    if (this._detune instanceof Pattern) {
      this._detune.apply(node.detune, cycleIndex, chordIndex);
    } else if (this._detune instanceof Envelope) {
      this._detune.apply(node.detune, start, duration, cycleIndex, chordIndex);
    } else {
      this._detune.connect(node.detune);
    }
  }

  private connectChain(
    notes: Note<T>[],
    barStart: number,
    barDuration: number
  ) {
    const chain = [
      this._connectorNode,
      ...this._signalChain,
      this._destination,
    ];

    chain.forEach((node, i) => {
      if (node instanceof AutomatableEffect)
        node.apply(notes, this._drome.metronome.bar, barStart, barDuration);

      if (this._connected) return;

      const nextNode = chain[i + 1];
      if (nextNode instanceof DromeAudioNode) node.connect(nextNode.input);
      else if (nextNode) node.connect(nextNode);
    });

    this._connected = true;
  }

  note(...input: (Nullable<T> | Nullable<T>[])[]) {
    this._cycles.note(...input);
    return this;
  }

  arrange(...input: [number, Nullable<T>[]][]) {
    this._cycles.arrange(...input);
    return this;
  }

  euclid(
    pulses: number | number[],
    steps: number,
    rotation: number | number[]
  ) {
    this._cycles.euclid(pulses, steps, rotation);
    return this;
  }

  hex(...hexes: (string | number)[]) {
    this._cycles.hex(...hexes);
    return this;
  }

  reverse() {
    this._cycles.reverse();
    return this;
  }

  sequence(steps: number, ...pulses: (number | number[])[]) {
    this._cycles.sequence(steps, ...pulses);
    return this;
  }

  xox(...input: (number | number[])[]) {
    this._cycles.xox(...input);
    return this;
  }

  fast(multiplier: number) {
    this._cycles.fast(multiplier);
    return this;
  }

  slow(multiplier: number) {
    this._cycles.slow(multiplier);
    return this;
  }

  stretch(multiplier: number) {
    this._cycles.stretch(multiplier);
    return this;
  }

  amplitude(input: number | Envelope | string) {
    if (input instanceof Envelope) {
      this._gain = input;
    } else {
      const pattern = isString(input) ? parsePatternString(input) : [input];
      const normalizedPattern = pattern.map((x) =>
        Array.isArray(x) ? x.map((y) => y * this._baseGain) : x * this._baseGain
      );
      this._gain.maxValue(...normalizedPattern);
    }
    return this;
  }

  adsr(a: number, d?: number, s?: number, r?: number) {
    this._gain.att(a);
    if (typeof d === "number") this._gain.dec(d);
    if (typeof s === "number") this._gain.sus(s);
    if (typeof r === "number") this._gain.rel(r);

    return this;
  }

  att(v: number) {
    this._gain.att(v);
    return this;
  }

  dec(v: number) {
    this._gain.dec(v);
    return this;
  }

  sus(v: number) {
    this._gain.sus(v);
    return this;
  }

  rel(v: number) {
    this._gain.rel(v);
    return this;
  }

  adsrMode(mode: AdsrMode) {
    this._gain.mode(mode);
    if (this._detune instanceof Envelope) this._detune.mode(mode);
    return this;
  }

  detune(input: number | Envelope | LfoNode | string) {
    if (input instanceof Envelope || input instanceof LfoNode) {
      this._detune = input;
    } else {
      const pattern = isString(input) ? parsePatternString(input) : [input];
      this._detune = new Pattern(...pattern);
    }

    return this;
  }

  filter(type: FilterTypeAlias, f: NSE, q?: NSE) {
    this._filter.type = filterTypeMap[type];

    if (f instanceof Envelope) {
      this._filter.frequency = f;
      this._filter.frequency.endValue = 30;
    } else {
      const pattern = isString(f) ? parsePatternString(f) : [f];
      this._filter.frequency = new Pattern(...pattern);
    }

    if (q instanceof Envelope) {
      this._filter.q = q;
    } else if (isString(q) || isNumber(q)) {
      const pattern = isString(q) ? parsePatternString(q) : [q];
      this._filter.q = new Pattern(...pattern);
    }

    return this;
  }

  effects(...nodes: DromeAudioNode[]) {
    nodes.forEach((node) => this._signalChain.add(node));
    return this;
  }

  beforePlay(barStart: number, barDuration: number) {
    this._startTime = barStart;
    const cycleIndex = this._drome.metronome.bar % this._cycles.length;
    const cycle = this._cycles.at(cycleIndex);
    const notes: Note<T>[] =
      cycle?.map((value, i) => {
        if (isNullish(value)) return null;
        return {
          value,
          start: barStart + i * (barDuration / cycle.length),
          duration: barDuration / cycle.length,
        };
      }) ?? [];

    console.log(notes);

    this.connectChain(notes, barStart, barDuration);

    return notes;
  }

  stop(stopTime: number) {
    const startTime = this._startTime ?? this.ctx.currentTime;
    const relTime = 0.25;

    if (startTime > stopTime) {
      this._audioNodes.forEach((node) => node.stop());
      this.cleanup();
    } else {
      this._audioNodes.forEach((node) => {
        if (node instanceof SynthesizerNode || node instanceof SampleNode) {
          node.gain.cancelScheduledValues(stopTime);
          node.gain.setValueAtTime(node.gain.value, stopTime);
          node.gain.linearRampToValueAtTime(0, stopTime + relTime);
        }
      });

      const handleEnded = (e: Event) => {
        this.cleanup();
        e.target?.removeEventListener("ended", handleEnded);
      };

      Array.from(this._audioNodes).forEach((node, i) => {
        if (i === 0) node.addEventListener("ended", handleEnded);
        node.stop(stopTime + relTime + 0.1);
      });
    }
  }

  cleanup() {
    this._audioNodes.forEach((node) => node.disconnect());
    this._audioNodes.clear();
    this._signalChain.forEach((node) => node.disconnect());
    this._signalChain.clear();
    this._connectorNode.disconnect();
    this._connected = false;
  }

  get ctx() {
    return this._drome.ctx;
  }

  get type() {
    return "rate" in this ? "sample" : "synth";
  }
}

export default Instrument;
export type { InstrumentOptions, InstrumentType };
