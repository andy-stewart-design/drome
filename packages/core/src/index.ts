import Envelope from "@/automation/envelope";
import LfoNode from "@/automation/lfo-node";
import Sample from "@/instruments/sample";
import Synth from "@/instruments/synth";
import Stack from "@/instruments/stack";
import SessionManager, { type QueueInput } from "@/managers/session-manager";
import BitcrusherEffect from "@/effects/effect-bitcrusher";
import DelayEffect from "@/effects/effect-delay";
import DistortionEffect from "@/effects/effect-distortion";
import DromeFilter from "@/effects/effect-filter";
import GainEffect from "@/effects/effect-gain";
import PanEffect from "@/effects/effect-pan";
import ReverbEffect from "./effects/effect-reverb";
import { MIDIObserver } from "./midi";
import { filterTypeMap, type FilterTypeAlias } from "@/constants/index";
import { isString } from "@/utils/validators";
import { addWorklets } from "@/utils/worklets";
import { parseParamInput, parsePatternInput } from "@/utils/parse-pattern";
import type {
  DistortionAlgorithm,
  DromeEventCallback,
  DromeEventType,
  Metronome,
  SNEL,
  WaveformAlias,
} from "@/types";
import SampleManager from "./managers/sample-manager";

type LogCallback = (log: string, logs: string[]) => void;

const BASE_GAIN = 0.8;
const NUM_CHANNELS = 8;

class Drome {
  readonly context: AudioContext;
  readonly audioChannels: GainNode[];
  private _sessionManager: SessionManager;
  private _sampleManager: SampleManager;
  private _suspendTimeoutId: ReturnType<typeof setTimeout> | undefined | null;
  private _logs: string[] = [];

  fil: (type: FilterTypeAlias, frequency: SNEL, q?: number) => DromeFilter;

  static async init(bpm?: number) {
    const ctx = new AudioContext();
    const [seshManager, sampManager] = await Promise.all([
      SessionManager.init(ctx, bpm),
      SampleManager.init(ctx),
    ]);

    const drome = new Drome(ctx, seshManager, sampManager);

    try {
      await Promise.all([drome.addWorklets()]);
    } catch (error) {
      console.warn(error);
    }

    return drome;
  }

  constructor(
    ctx: AudioContext,
    seshManager: SessionManager,
    sampManager: SampleManager,
  ) {
    this.context = ctx;
    this._sessionManager = seshManager;
    this._sampleManager = sampManager;
    this.audioChannels = Array.from({ length: NUM_CHANNELS }, () => {
      const gain = new GainNode(this.ctx, { gain: BASE_GAIN });
      gain.connect(this.ctx.destination);
      return gain;
    });
    const prebarCb = this.clock.on("prebar", this.preTick.bind(this));
    const barCb = this.clock.on("bar", this.handleTick.bind(this));
    this.listeners.clock.internal.add(prebarCb);
    this.listeners.clock.internal.add(barCb);

    this.fil = this.filter.bind(this);
  }

  private preTick() {
    this._sessionManager.precommit();
  }

  private handleTick(met: Metronome, time: number) {
    this._sessionManager.commit();

    this.instruments.forEach((inst) => {
      inst.play(this.barStartTime, this.barDuration);
    });
    this.lfos.forEach((lfo) => {
      if (!lfo.started) lfo.start(this.barStartTime);
    });
  }

  private async addWorklets() {
    await addWorklets(this.ctx);
  }

  bpm(n: number) {
    this.clock.bpm(n);
  }

  queue(input: QueueInput) {
    this._sessionManager.enqueue(input);
  }

  async start() {
    if (!this.clock.paused) return;
    if (this._suspendTimeoutId) clearTimeout(this._suspendTimeoutId);
    await this._sampleManager.preloadSamples(this.instruments);
    this._sessionManager.start();
  }

  stop() {
    const fade = 0.25;
    this._sessionManager.stop(fade);
    this.audioChannels.forEach((chan) => {
      chan.gain.cancelScheduledValues(this.ctx.currentTime);
      chan.gain.value = BASE_GAIN;
    });
    this._suspendTimeoutId = setTimeout(() => {
      this._sessionManager.suspend();
      this._suspendTimeoutId = null;
    }, fade * 5000); // convert seconds to milliseconds and double
  }

  log(msg: string) {
    this._logs.push(msg);
    console.log(`[DROME]: ${msg}`);
    this.listeners.log.forEach((cb) => cb(msg, this._logs));
  }

  clearLogs() {
    this._logs.length = 0;
  }

  on(type: "log", fn: LogCallback): void;
  on(type: DromeEventType, fn: DromeEventCallback): void;
  on(type: DromeEventType | "log", fn: DromeEventCallback | LogCallback) {
    if (type === "log") {
      this.queue({ type: "log", fn: fn as LogCallback });
    } else {
      this.queue({ type: "clock", fnType: type, fn: fn as DromeEventCallback });
    }
  }

  synth(...types: WaveformAlias[]) {
    const destination = this.audioChannels[0];
    if (!destination) throw new Error("Cannot find audio channel");
    const synth = new Synth(this, {
      type: types,
      destination,
      defaultCycle: 60,
      nullValue: 0,
    });
    return synth;
  }

  sample(...sampleIds: string[]) {
    const destination = this.audioChannels[1];
    if (!destination) throw new Error("Cannot find audio channel");
    const sample = new Sample(this, {
      destination,
      sampleIds: sampleIds,
      defaultCycle: 0,
      nullValue: 0,
    });
    return sample;
  }

  stack(...instruments: (Synth | Sample)[]) {
    return new Stack(instruments);
  }

  midicc(nameOrId: string, defaultValue = 0) {
    if (!this.midi) return 0;
    const observer = new MIDIObserver("controlchange", nameOrId, defaultValue);
    this.queue(observer);
    return observer;
  }

  env(maxValue: number, startValue = 0, endValue?: number) {
    return new Envelope(maxValue, startValue, endValue);
  }

  lfo(baseValue: number, scale = 1, rate = 1) {
    const lfo = new LfoNode(this.ctx, { baseValue, scale, rate });
    lfo.bpm(this.clock.beatsPerMin);
    this.queue(lfo);
    return lfo;
  }

  crush(_bitDepth: SNEL, rateReduction = 1) {
    return new BitcrusherEffect(this.ctx, {
      bitDepth: parseParamInput(_bitDepth),
      rateReduction,
    });
  }

  delay(_delayTime: number | string, feedback: number) {
    return new DelayEffect(this, {
      delayTime: parsePatternInput(_delayTime),
      feedback,
    });
  }

  distort(amount: SNEL, postgain?: number, type?: DistortionAlgorithm) {
    return new DistortionEffect(this.ctx, {
      distortion: parseParamInput(amount),
      postgain,
      type,
    });
  }

  filter(type: FilterTypeAlias, frequency: SNEL, q?: number) {
    return new DromeFilter(this.ctx, {
      type: filterTypeMap[type],
      frequency: parseParamInput(frequency),
      q,
    });
  }

  gain(input: SNEL) {
    return new GainEffect(this.ctx, { gain: parseParamInput(input) });
  }

  pan(input: SNEL) {
    return new PanEffect(this.ctx, { pan: parseParamInput(input) });
  }

  reverb(a: SNEL, b?: number, c?: number, d?: number): ReverbEffect;
  reverb(a: SNEL, b?: string, c?: string): ReverbEffect;
  reverb(mix: SNEL, b: unknown = 1, c: unknown = 1600, d?: number) {
    let effect: ReverbEffect;
    const parsedMix = parseParamInput(mix);

    if (typeof b === "number" && typeof c === "number") {
      const lpfEnd = d || 1000;
      const opts = { mix: parsedMix, decay: b, lpfStart: c, lpfEnd };
      effect = new ReverbEffect(this, opts);
    } else {
      const name = isString(b) ? b : "echo";
      const bank = isString(c) ? c : "fx";
      const src = name.startsWith("https")
        ? ({ registered: false, url: name } as const)
        : ({ registered: true, name, bank } as const);
      effect = new ReverbEffect(this, { mix: parsedMix, src });
    }

    return effect;
  }

  get ctx() {
    return this.context;
  }

  get clock() {
    return this._sessionManager.clock;
  }

  get metronome() {
    return this.clock.metronome;
  }

  get midi() {
    return this._sessionManager.midi;
  }

  get listeners() {
    return this._sessionManager.listeners;
  }

  get instruments() {
    return this._sessionManager.instruments;
  }

  get lfos() {
    return this._sessionManager.lfos;
  }

  get currentTime() {
    return this.context.currentTime;
  }

  get paused() {
    return this.clock.paused;
  }

  get barStartTime() {
    return this.clock.barStartTime;
  }

  get barDuration() {
    return this.clock.barDuration;
  }

  get beatsPerMin() {
    return this.clock.beatsPerMin;
  }

  get sampleBanks() {
    return this._sampleManager.sampleBanks;
  }

  get bufferCache() {
    return this._sampleManager.bufferCache;
  }

  get reverbCache() {
    return this._sampleManager.reverbCache;
  }

  get userSamples() {
    return this._sampleManager.userSamples;
  }

  get createMidiController() {
    return this._sessionManager.createMidiController.bind(this._sessionManager);
  }

  get addSamples() {
    return this._sampleManager.addSamples.bind(this._sampleManager);
  }

  get loadSample() {
    return this._sampleManager.loadSample.bind(this._sampleManager);
  }
}

export default Drome;
