import { isNumber } from "@/utils/validators";

type Waveform = "sine" | "sawtooth" | "triangle" | "square";
type AudioParam = (typeof audioParams)[number]["name"];

interface SynthesizerProcessorOptions {
  type: Waveform;
  //   filterType: FilterType;
}

interface SynthesizerOptions {
  processorOptions: Partial<SynthesizerProcessorOptions>;
}

function getOscillator(type: Waveform) {
  switch (type) {
    case "sawtooth":
      return (p: number) => 2.0 * p - 1.0;
    case "triangle":
      return (p: number) => (p < 0.5 ? 4.0 * p - 1.0 : 3.0 - 4.0 * p);
    case "square":
      return (p: number) => (p < 0.5 ? 1.0 : -1.0);
    default:
      return (p: number) => Math.sin(2.0 * Math.PI * p);
  }
}

const audioParams = [
  { name: "begin", defaultValue: 0, min: 0, max: 3.4028234663852886e38 },
  { name: "end", defaultValue: 0, min: 0, max: 3.4028234663852886e38 },
  { name: "frequency", defaultValue: 440, min: -24000, max: 24000 },
  { name: "gain", defaultValue: 1, min: 0, max: 3.4028234663852886e38 },
  { name: "detune", defaultValue: 0, min: -153600, max: 153600 },
] as const;

class SynthProcessor extends AudioWorkletProcessor {
  private phase = 0;
  private type: Waveform;

  constructor({ processorOptions = {} }: SynthesizerOptions) {
    super();
    this.phase = 0;
    this.type = processorOptions.type ?? "sine";
  }

  static get parameterDescriptors() {
    return audioParams;
  }

  process(
    _: Float32Array[][],
    outputs: Float32Array[][],
    params: Record<AudioParam, Float32Array>
  ) {
    const begin = params.begin?.[0];
    const end = params.end?.[0];
    const output = outputs[0];
    const channel = output?.[0];

    if (!output || !channel || !isNumber(begin) || !isNumber(end)) {
      throw new Error("Something has gone wrong foo");
    }

    for (let i = 0; i < channel.length; i++) {
      const sampleTime = currentTime + i / sampleRate;

      if (end > begin && sampleTime > end) {
        for (let j = i; j < channel.length; j++) {
          for (const channel of output) channel[j] = 0.0;
        }
        return false;
      }

      if (sampleTime <= begin) {
        for (const channel of output) channel[i] = 0.0;
        continue;
      }

      const frequency = params.frequency?.[i] ?? params.frequency?.[0] ?? 440;
      const detune = params.detune?.[i] ?? params.detune?.[0] ?? 0;
      const gain = params.gain?.[i] ?? params.gain?.[0] ?? 0;

      const detuneFactor = Math.pow(2.0, detune / 1200.0);
      const dt = (frequency * detuneFactor) / sampleRate;
      const v = getOscillator(this.type)(this.phase);

      for (const channel of output) {
        const fadeSamples = sampleRate * 0.003; // 3ms
        const t = ((sampleTime - begin) * sampleRate) / fadeSamples;
        const amp = Math.max(0, Math.min(1, t));
        channel[i] = v * gain * amp;
      }

      let pn = this.phase + dt;
      if (pn >= 1.0) pn -= 1.0;
      this.phase = pn;
    }
    return true;
  }
}

registerProcessor("synth-oscillator", SynthProcessor);
