import Synth from "@/instruments/synth";
import { bufferId } from "@/utils/cache-id";
import { loadSample } from "@/utils/load-sample";
import { getSampleBanks, getSamplePath } from "@/utils/samples";
import { isArray } from "@/utils/validators";
import type Sample from "@/instruments/sample";
import type { SampleBankSchema } from "@/utils/samples-validate";

class SampleManager {
  private _ctx: AudioContext;
  readonly sampleBanks: SampleBankSchema | null = null;
  readonly bufferCache: Map<string, AudioBuffer[]> = new Map();
  readonly reverbCache: Map<string, AudioBuffer> = new Map();
  readonly userSamples: Map<string, Map<string, string[]>> = new Map();

  static async init(ctx: AudioContext) {
    const response = await getSampleBanks();
    const manager = new SampleManager(ctx, response.data);
    return manager;
  }

  constructor(ctx: AudioContext, banks: SampleBankSchema | null) {
    this._ctx = ctx;
    this.sampleBanks = banks;
  }

  private getSamplePath(bank: string, name: string, index: number) {
    const paths = this.userSamples.get(bank)?.get(name);
    if (paths) return paths[index % paths.length];
    else return getSamplePath(this.sampleBanks, bank, name, index);
  }

  async preloadSamples(instruments: Set<Synth | Sample>) {
    const samplePromises = [...instruments].flatMap((inst) => {
      if (inst instanceof Synth) return [];
      return inst.preloadSamples();
    });
    await Promise.all(samplePromises);
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

    const buffer = await loadSample(this._ctx, samplePath);

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

  addSamples(record: Record<string, string | string[]>, bank = "user") {
    const samples = Object.entries(record).map(([k, v]) => {
      return [k, isArray(v) ? v : [v]] as const;
    });

    this.userSamples.set(bank, new Map(samples));
  }
}

export default SampleManager;
