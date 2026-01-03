// TODO: Add methods for supersaw synth

import AudioClock from "@/clock/audio-clock";
import Envelope from "@/automation/envelope";
import LfoNode from "@/automation/lfo-node";
import Sample from "@/instruments/sample";
import Synth from "@/instruments/synth";
import BitcrusherEffect from "@/effects/effect-bitcrusher";
import DelayEffect from "@/effects/effect-delay";
import DistortionEffect from "@/effects/effect-distortion";
import DromeFilter from "@/effects/effect-filter";
import GainEffect from "@/effects/effect-gain";
import PanEffect from "@/effects/effect-pan";
import ReverbEffect from "./effects/effect-reverb";
import { filterTypeMap, type FilterTypeAlias } from "@/constants/index";
import { getSampleBanks, getSamplePath } from "@/utils/samples";
import { loadSample } from "@/utils/load-sample";
import { bufferId } from "@/utils/cache-id";
import { isString } from "@/utils/validators";
import { addWorklets } from "@/utils/worklets";
import { parseParamInput, parsePatternInput } from "@/utils/parse-pattern";
import type { SampleBankSchema } from "@/utils/samples-validate";
import type { DistortionAlgorithm, Metronome, SNEL } from "@/types";

const BASE_GAIN = 0.8;
const NUM_CHANNELS = 8;

class Drome {
  readonly clock: AudioClock;
  readonly instruments: Set<Synth | Sample> = new Set();
  readonly lfos: Set<LfoNode> = new Set();
  readonly audioChannels: GainNode[];
  readonly bufferCache: Map<string, AudioBuffer[]> = new Map();
  readonly reverbCache: Map<string, AudioBuffer> = new Map();
  private sampleBanks: SampleBankSchema | null = null;
  readonly userSamples: Map<string, Map<string, string[]>> = new Map();
  private suspendTimeoutId: ReturnType<typeof setTimeout> | undefined | null;

  fil: (type: FilterTypeAlias, frequency: SNEL, q?: number) => DromeFilter;

  static async init(bpm?: number) {
    const drome = new Drome(bpm);

    try {
      await Promise.all([drome.loadSampleBanks(), drome.addWorklets()]);
    } catch (error) {
      console.warn(error);
    }

    return drome;
  }

  constructor(bpm?: number) {
    this.clock = new AudioClock(bpm);
    this.audioChannels = Array.from({ length: NUM_CHANNELS }, () => {
      const gain = new GainNode(this.ctx, { gain: BASE_GAIN });
      gain.connect(this.ctx.destination);
      return gain;
    });
    this.clock.on("bar", this.handleTick.bind(this));

    this.fil = this.filter.bind(this);
  }

  bpm(n: number) {
    this.clock.bpm(n);
  }

  private handleTick(met: Metronome) {
    this.instruments.forEach((inst) => {
      inst.play(this.barStartTime, this.barDuration);
    });
    this.lfos.forEach((lfo) => {
      if (!lfo.started) lfo.start(this.barStartTime);
    });
  }

  private async preloadSamples() {
    const samplePromises = [...this.instruments].flatMap((inst) => {
      if (inst instanceof Synth) return [];
      return inst.preloadSamples();
    });
    await Promise.all(samplePromises);
  }

  private getSamplePath(bank: string, name: string, index: number) {
    const paths = this.userSamples.get(bank)?.get(name);
    if (paths) return paths[index % paths.length];
    else return getSamplePath(this.sampleBanks, bank, name, index);
  }

  async addWorklets() {
    await addWorklets(this.ctx);
  }

  async loadSampleBanks() {
    const response = await getSampleBanks();

    if (response.data) this.sampleBanks = response.data;
  }

  addSamples(record: Record<string, string | string[]>, bank = "user") {
    const samples = Object.entries(record).map(([k, v]) => {
      return [k, Array.isArray(v) ? v : [v]] as const;
    });

    this.userSamples.set(bank, new Map(samples));
  }

  async loadSample(bank: string, name: string, i: string | number | undefined) {
    const [id, index] = bufferId(bank, name, i);

    const samplePath = this.getSamplePath(bank, name, index);
    const cachedBuffers = this.bufferCache.get(id);

    if (cachedBuffers?.[index]) {
      return { path: samplePath, buffer: cachedBuffers[index] };
    } else if (!samplePath) {
      console.warn(`Couldn't find a sample: ${bank} ${name}`);
      return { path: null, buffer: null };
    }

    const buffer = await loadSample(this.ctx, samplePath);

    if (!buffer) {
      console.warn(`Couldn't load sample ${name} from ${samplePath}`);
      return { path: null, buffer: null };
    } else if (cachedBuffers && !cachedBuffers[index]) {
      cachedBuffers[index] = buffer;
    } else if (!cachedBuffers) {
      const buffers: AudioBuffer[] = [];
      buffers[index] = buffer;
      this.bufferCache.set(id, buffers);
    }

    return { path: samplePath, buffer };
  }

  async start() {
    if (!this.clock.paused) return;
    if (this.suspendTimeoutId) clearTimeout(this.suspendTimeoutId);
    await this.preloadSamples();
    this.clock.start();
  }

  private cleanupLfos(when: number) {
    this.lfos.forEach((lfo) => {
      const clear = () => {
        lfo.disconnect();
        lfo.removeEventListener("ended", clear);
        this.lfos.delete(lfo);
      };
      lfo.addEventListener("ended", clear);
      lfo.stop(when);
    });
  }

  stop() {
    const fade = 0.25;
    this.clock.stop();
    this.instruments.forEach((inst) => {
      inst.onDestory = () => this.instruments.delete(inst);
      inst.stop(this.ctx.currentTime, fade);
    });
    this.cleanupLfos(this.ctx.currentTime + fade);
    // this.clearReplListeners();
    this.audioChannels.forEach((chan) => {
      chan.gain.cancelScheduledValues(this.ctx.currentTime);
      chan.gain.value = BASE_GAIN;
    });
    this.suspendTimeoutId = setTimeout(() => {
      this.ctx.suspend();
      this.suspendTimeoutId = null;
    }, fade * 5000); // convert seconds to milliseconds and double
  }

  public clear() {
    this.instruments.forEach((inst) => inst.stop(this.clock.nextBarStartTime));
    this.instruments.clear();
    this.cleanupLfos(this.clock.nextBarStartTime);
    // this.clearReplListeners();
  }

  synth(...types: OscillatorType[]) {
    const destination = this.audioChannels[0];
    if (!destination) throw new Error("Cannot find audio channel");
    const synth = new Synth(this, {
      type: types,
      destination,
      defaultCycle: 60,
      nullValue: 0,
    });
    this.instruments.add(synth);
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
    this.instruments.add(sample);
    return sample;
  }

  env(maxValue: number, startValue = 0, endValue?: number) {
    return new Envelope(maxValue, startValue, endValue);
  }

  lfo(baseValue: number, scale = 1, rate = 1) {
    const lfo = new LfoNode(this.ctx, { baseValue, scale, rate });
    lfo.bpm(this.clock.beatsPerMin);
    this.lfos.add(lfo);
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
    return this.clock.ctx;
  }

  get metronome() {
    return this.clock.metronome;
  }

  get currentTime() {
    return this.ctx.currentTime;
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
}

export default Drome;
