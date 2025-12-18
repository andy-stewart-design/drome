import AudioClock from "@/clock/audio-clock";
import Envelope from "@/automation/envelope";
import LFO from "@/automation/lfo";
import Sample from "@/instruments/sample";
import Synth from "@/instruments/synth";
import { getSampleBanks, getSamplePath } from "@/utils/samples";
import { loadSample } from "@/utils/load-sample";
import { bufferId } from "@/utils/cache-id";
import { addWorklets } from "./utils/worklets";
import type { SampleBankSchema } from "./utils/samples-validate";

const BASE_GAIN = 0.8;
const NUM_CHANNELS = 8;

class Drome {
  readonly clock: AudioClock;
  readonly instruments: Set<Synth | Sample> = new Set();
  readonly audioChannels: GainNode[];
  readonly bufferCache: Map<string, AudioBuffer[]> = new Map();
  readonly reverbCache: Map<string, AudioBuffer> = new Map();
  private sampleBanks: SampleBankSchema | null = null;
  readonly userSamples: Map<string, Map<string, string[]>> = new Map();

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
      const gain = new GainNode(this.ctx, { gain: 0.75 });
      gain.connect(this.ctx.destination);
      return gain;
    });
    this.clock.on("bar", this.handleTick.bind(this));
  }

  private handleTick() {
    this.instruments.forEach((inst) =>
      inst.play(this.barStartTime, this.barDuration)
    );
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
    await this.preloadSamples();
    this.clock.start();
  }

  stop() {
    this.clock.stop();
    this.instruments.forEach((inst) => inst.stop(this.ctx.currentTime));
    // this.clearReplListeners();
    this.audioChannels.forEach((chan) => {
      chan.gain.cancelScheduledValues(this.ctx.currentTime);
      chan.gain.value = BASE_GAIN;
    });
  }

  public clear() {
    this.instruments.clear();
    // this.clearReplListeners();
  }

  synth(...types: OscillatorType[]) {
    const destination = this.audioChannels[0];
    if (!destination) throw new Error("Cannot find audio channel");
    const synth = new Synth(this, {
      type: types,
      destination,
      defaultCycle: [[[60]]],
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
      defaultCycle: [[0]],
      nullValue: 0,
    });
    this.instruments.add(sample);
    return sample;
  }

  env(maxValue: number, startValue = 0, endValue?: number) {
    return new Envelope(maxValue, startValue, endValue);
  }

  lfo(minValue: number, maxValue: number, speed: number) {
    const value = (maxValue + minValue) / 2;
    const depth = maxValue - value;
    const bpm = this.beatsPerMin;
    return new LFO(this.ctx, { value, depth, speed, bpm });
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
