import AutomatableEffect from "@/abstracts/effect-automatable";
import DromeAudioNode from "@/abstracts/drome-audio-node";
import DromeArrayNullable from "@/array/drome-array-nullable";
import LfoNode from "@/automation/lfo-node";
import Envelope from "@/automation/envelope";
import Pattern from "@/automation/pattern";
import { MIDIObserver } from "@/midi";
import { parsePatternString } from "../utils/parse-pattern";
import { isArray, isNullish, isNumber, isString } from "../utils/validators";
import { filterTypeMap, type FilterTypeAlias } from "@/constants/index";
import type Drome from "../index";
import type SynthNode from "@/audio-nodes/composite-synth-node";
import type SampleNode from "@/audio-nodes/composite-sample-node";
import type {
  AdsrMode,
  AdsrEnvelope,
  InstrumentType,
  Note,
  SNELO,
  Nullable,
} from "@/types";
import type { FilterType } from "@/types";
import type MIDIRouter from "@/midi/midi-router";

type NonNullNote = NonNullable<Note<number | number[]>>;

interface InstrumentOptions<T> {
  destination: AudioNode;
  defaultCycle: T;
  nullValue: T;
  baseGain?: number;
  adsr?: AdsrEnvelope;
}

interface FrequencyParams {
  type?: FilterType;
  frequency?: Pattern | Envelope | LfoNode | MIDIObserver<"controlchange">;
  q?: Pattern | Envelope | MIDIObserver<"controlchange">;
}

abstract class Instrument<T> {
  protected _drome: Drome;
  protected _cycles: DromeArrayNullable<T>;
  protected _midiRouter: MIDIRouter | null;
  private _destination: AudioNode;
  protected _connectorNode: GainNode;
  protected readonly _audioNodes: Set<SynthNode | SampleNode>;
  private _signalChain: Set<DromeAudioNode>;
  private _baseGain: number;
  protected _gain: Envelope;
  private _detune: Pattern | Envelope | LfoNode | MIDIObserver<"controlchange">;
  private _muted: boolean;
  protected _filter: FrequencyParams = {};
  private _connected = false;
  protected _stopTime: number | null = null;
  protected _legato = false;
  public onDestroy: (() => void) | undefined;

  // Method Aliases
  dt: (input: number | Envelope | string) => this;
  env: (a: number, d?: number, s?: number, r?: number) => this;
  envMode: (mode: AdsrMode) => this;
  fil: (type: FilterTypeAlias, f: SNELO, q: SNELO) => this;
  fx: (...nodes: DromeAudioNode[]) => this;
  leg: (v?: boolean) => this;
  midichan: (n: number | number[]) => this;
  rev: () => this;
  seq: (steps: number, ...pulses: (number | number[])[]) => this;

  constructor(drome: Drome, opts: InstrumentOptions<T>) {
    this._drome = drome;
    this._cycles = new DromeArrayNullable(opts.defaultCycle);
    this._midiRouter = null;

    this._destination = opts.destination;
    this._connectorNode = new GainNode(drome.ctx);
    this._audioNodes = new Set();
    this._signalChain = new Set();

    this._baseGain = opts.baseGain ?? 0.35;
    this._gain = new Envelope(0, this._baseGain);
    this._detune = new Pattern(0);
    this._muted = false;

    this.dt = this.detune.bind(this);
    this.env = this.adsr.bind(this);
    this.envMode = this.adsrMode.bind(this);
    this.fil = this.filter.bind(this);
    this.fx = this.effects.bind(this);
    this.leg = this.legato.bind(this);
    this.midichan = this.midichannel.bind(this);
    this.rev = this.reverse.bind(this);
    this.seq = this.sequence.bind(this);
  }

  abstract push(): void;

  protected applyNodeEffects(
    node: SynthNode | SampleNode,
    note: NonNullNote,
    index: number,
  ) {
    const duration = this.applyGain(node, note.start, note.duration, index);
    this.applyFilter(node, note.start, duration, index);
    this.applyDetune(node, note.start, duration, index);
    return duration;
  }

  private applyGain(
    node: SynthNode | SampleNode,
    start: number,
    dur: number,
    chordIdx: number,
  ) {
    if (!node.gain) return 0;
    const cycleIndex = this._drome.metronome.bar % this._cycles.length;
    return this._gain.apply(node.gain, start, dur, cycleIndex, chordIdx);
  }

  private applyFilter(
    node: SynthNode | SampleNode,
    start: number,
    dur: number,
    chordIdx: number,
  ) {
    const { filterFrequency: filFreq, filterQ: filQ } = node;
    if (!filFreq || !filQ) return;
    const cycleIndex = this._drome.metronome.bar % this._cycles.length;

    if (this._filter.frequency instanceof Pattern) {
      this._filter.frequency.apply(filFreq, cycleIndex, chordIdx);
    } else if (this._filter.frequency instanceof Envelope) {
      this._filter.frequency.apply(filFreq, start, dur, cycleIndex, chordIdx);
    } else if (this._filter.frequency instanceof LfoNode) {
      filFreq.value = this._filter.frequency.baseValue;
      this._filter.frequency.connect(filFreq);
    } else if (this._filter.frequency instanceof MIDIObserver) {
      const { currentValue } = this._filter.frequency;
      filFreq.setValueAtTime(currentValue, this.ctx.currentTime);
      this._filter.frequency.onUpdate(({ value }) => {
        filFreq.setValueAtTime(value, this.ctx.currentTime);
      });
    } else {
      console.warn("Invalid type:", this._filter.frequency satisfies undefined);
    }

    if (this._filter.q instanceof Pattern) {
      this._filter.q.apply(filQ, cycleIndex, chordIdx);
    } else if (this._filter.q instanceof Envelope) {
      this._filter.q.apply(filQ, start, dur, cycleIndex, chordIdx);
    } else if (this._filter.q instanceof MIDIObserver) {
      const { currentValue } = this._filter.q;
      filQ.setValueAtTime(currentValue, this.ctx.currentTime);
      this._filter.q.onUpdate(({ value }) => {
        filQ.setValueAtTime(value, this.ctx.currentTime);
      });
    }
  }

  private applyDetune(
    node: SynthNode | SampleNode,
    start: number,
    duration: number,
    chordIndex: number,
  ) {
    if (!node.detune) return;
    const cycleIndex = this._drome.metronome.bar % this._cycles.length;

    if (this._detune instanceof Pattern) {
      this._detune.apply(node.detune, cycleIndex, chordIndex);
    } else if (this._detune instanceof Envelope) {
      this._detune.apply(node.detune, start, duration, cycleIndex, chordIndex);
    } else if (this._detune instanceof MIDIObserver) {
      node.detune.setValueAtTime(
        this._detune.currentValue,
        this.ctx.currentTime,
      );
      this._detune.onUpdate(({ value }) => {
        node.detune?.setValueAtTime(value, this.ctx.currentTime);
      });
    } else if (this._detune instanceof LfoNode) {
      this._detune.connect(node.detune);
    } else {
      console.warn("Invalid type:", this._detune satisfies never);
    }
  }

  private connectChain(
    notes: Note<T>[],
    barStart: number,
    barDuration: number,
  ) {
    const chain = [
      this._connectorNode,
      ...this._signalChain,
      this._destination,
    ];

    chain.forEach((node, i) => {
      if (node instanceof AutomatableEffect) {
        node.apply(notes, this._drome.metronome.bar, barStart, barDuration);
      }

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
    rotation: number | number[],
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

  legato(v = true) {
    this._legato = v;
    return this;
  }

  gain(input: number | Envelope | string) {
    if (this._muted) return this;

    if (input instanceof Envelope) {
      this._gain = input;
    } else {
      const pattern = isString(input) ? parsePatternString(input) : [input];
      const normalizedPattern = pattern.map((x) =>
        isArray(x) ? x.map((y) => y * this._baseGain) : x * this._baseGain,
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

  detune(input: SNELO | MIDIObserver<"controlchange">) {
    if (
      input instanceof Envelope ||
      input instanceof LfoNode ||
      input instanceof MIDIObserver
    ) {
      this._detune = input;
    } else {
      const pattern = isString(input) ? parsePatternString(input) : [input];
      this._detune = new Pattern(...pattern);
    }

    return this;
  }

  filter(
    type: FilterTypeAlias,
    f: SNELO | MIDIObserver<"controlchange">,
    q?: SNELO,
  ) {
    this._filter.type = filterTypeMap[type];

    if (f instanceof Envelope) {
      this._filter.frequency = f;
      this._filter.frequency.endValue = 30;
    } else if (f instanceof LfoNode || f instanceof MIDIObserver) {
      this._filter.frequency = f;
    } else if (isNumber(f) || isString(f)) {
      const pattern = isString(f) ? parsePatternString(f) : [f];
      this._filter.frequency = new Pattern(...pattern);
    } else {
      console.warn("Invalid type:", f satisfies never);
    }

    if (q instanceof Envelope || q instanceof MIDIObserver) {
      this._filter.q = q;
    } else if (isString(q) || isNumber(q)) {
      const pattern = isString(q) ? parsePatternString(q) : [q];
      this._filter.q = new Pattern(...pattern);
    } else if (q instanceof LfoNode) {
      // TODO: Figure out what to do here
    } else {
      console.warn("Invalid type:", q satisfies LfoNode | undefined);
    }

    return this;
  }

  mute(mute = false) {
    this._muted = mute;
    this.gain(0);
    return this;
  }

  effects(...nodes: DromeAudioNode[]) {
    nodes.forEach((node) => this._signalChain.add(node));
    return this;
  }

  midi(identifier: string, velocity?: number) {
    if (!this._drome.midi) {
      console.warn("Must enable MIDI access before using midi commands.");
      return this;
    }

    const router = this._drome.midi?.createRouter(identifier);

    if (!router) {
      console.warn(`Could not find MIDI device for: ${identifier}`);
      return this;
    }

    if (velocity) router.velocity(velocity);
    this._midiRouter = router;
    return this;
  }

  midichannel(n: number | number[]) {
    if (!this._midiRouter) {
      console.warn("Must use `midi` method before calling `midichannel`");
      return this;
    }

    this._midiRouter.channel(n);
    return this;
  }

  protected beforePlay(barStart: number, barDuration: number) {
    if (this._detune instanceof MIDIObserver) this._detune.clear();

    const cycleIndex = this._drome.metronome.bar % this._cycles.length;
    const cycle = this._cycles.at(cycleIndex);
    const notes: Note<T>[] = cycle.map((value, i) => {
      if (isNullish(value)) return null;
      const start = barStart + i * (barDuration / cycle.length);
      const baseDuration = barDuration / cycle.length;

      if (!this._legato) {
        return { value, start, baseDuration, duration: baseDuration };
      } else {
        const nextNonNull = cycle.findIndex((v, j) => j > i && v !== null);
        const nullCount = (nextNonNull === -1 ? cycle.length : nextNonNull) - i;
        const duration = baseDuration * nullCount;
        return { value, start, baseDuration, duration };
      }
    });

    this.connectChain(notes, barStart, barDuration);

    return notes;
  }

  stop(when = 0, fadeTime = 0) {
    const stopStartTime = when ?? this.ctx.currentTime;
    this._stopTime = stopStartTime + fadeTime;

    if (fadeTime) {
      Array.from(this._audioNodes).forEach((node, i) => {
        node.gain?.cancelScheduledValues(stopStartTime);
        node.gain?.setValueAtTime(node.gain?.value, stopStartTime);
        node.gain?.linearRampToValueAtTime(0, stopStartTime + fadeTime);
        node.stop(stopStartTime + fadeTime + 0.1);
      });
    }
  }

  destroy() {
    if (this._audioNodes.size) {
      this._audioNodes.forEach((node) => {
        node.disconnect();
        this._audioNodes.delete(node);
        node.destory();
      });
      this._audioNodes.clear();
    }
    if (this._signalChain.size) {
      this._signalChain.forEach((node) => node.disconnect());
      this._signalChain.clear();
    }
    if (this._midiRouter) {
      this._drome.midi?.removeRouter(this._midiRouter);
      this._midiRouter.destroy();
    }
    this._connectorNode.disconnect();
    this._connected = false;
    this._baseGain = 0;
    this._stopTime = null;
    this.onDestroy?.();
  }

  get ctx() {
    return this._drome.ctx;
  }

  get clock() {
    return this._drome.clock;
  }

  get type() {
    return "rate" in this ? "sample" : "synth";
  }
}

export default Instrument;
export type { InstrumentOptions, InstrumentType };
