import { isNumber } from "@/utils/validators";
import type { LfoNodeMessage } from "@/automation/lfo-node";

interface LfoProcessorOptions {
  type: keyof typeof oscillators;
  phaseOffset: number;
  normalize: boolean;
}

interface LfoOptions {
  processorOptions: Partial<LfoProcessorOptions>;
}

type LfoParameter = (typeof parameterDescriptors)[number]["name"];
type LfoParameterData = Record<LfoParameter, number>;
type LfoProcessorMessage = { type: "ended"; time: number };

const parameterDescriptors = [
  { name: "frequency", defaultValue: 2, minValue: 0.01, maxValue: 100 },
  { name: "phaseOffset", defaultValue: 0, minValue: 0, maxValue: 1 },
  { name: "scale", defaultValue: 0, minValue: 0, maxValue: 20000 },
  { name: "beatsPerMinute", defaultValue: 120, minValue: 20, maxValue: 20000 },
  { name: "beatsPerBar", defaultValue: 4, minValue: 1, maxValue: 8 },
  { name: "rate", defaultValue: 1, minValue: 0, maxValue: 20000 },
] as const;

// const polyBlep = (p: number, dt: number) => {
//   if (p < dt) {
//     p /= dt;
//     return p + p - p * p - 1.0;
//   } else if (p > 1.0 - dt) {
//     p = (p - 1.0) / dt;
//     return p * p + p + p + 1.0;
//   }
//   return 0;
// };

const oscillators = {
  sine: (p: number) => Math.sin(2.0 * Math.PI * p),
  sawtooth: (p: number, dt: number) => 2.0 * p - 1.0,
  //   sawtooth: (p: number, dt: number) => 2.0 * p - 1.0 - polyBlep(p, dt),
  triangle: (p: number) => (p < 0.5 ? 4.0 * p - 1.0 : 3.0 - 4.0 * p),
  //  square: (p: number) => Math.tanh(Math.sin(2.0 * Math.PI * p) * 15),
  square: (p: number) => (p < 0.5 ? 1.0 : -1.0),
};

class LFOProcessor extends AudioWorkletProcessor {
  private type: keyof typeof oscillators;
  private phase: number;
  private started = false;
  private scheduledStartTime: number | null = null;
  private scheduledStopTime: number | null = null;
  private normalize: boolean;

  static get parameterDescriptors() {
    return parameterDescriptors;
  }

  constructor({ processorOptions = {} }: LfoOptions) {
    super();
    this.phase = 0.0;
    this.type = processorOptions.type ?? "sine";
    this.normalize = processorOptions.normalize ?? false;
    this.port.onmessage = ({ data }: MessageEvent<LfoNodeMessage>) => {
      switch (data.type) {
        case "start":
          this.scheduledStartTime = data.time || currentTime;
          this.phase = 0.0;
          break;
        case "stop":
          this.scheduledStopTime = data.time || currentTime;
          break;
        case "reset":
          this.phase = 0.0;
          break;
        case "oscillatorType":
          this.type = data.oscillatorType;
          break;
        case "normalize":
          this.normalize = data.normalize;
          break;
      }
    };
  }

  postEndedMessage(time: number) {
    const msg = { type: "ended", time };
    this.port.postMessage(msg);
  }

  process(
    _: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ) {
    const output = outputs[0];
    const bpmArray = parameters.beatsPerMinute;
    const bpbArray = parameters.beatsPerBar;
    const rateArray = parameters.rate;
    const offsetArray = parameters.phaseOffset;
    const scaleArray = parameters.scale;

    if (!output) return true;

    const blocksize = output?.[0]?.length ?? 0;
    const startTime = this.scheduledStartTime;
    const stopTime = this.scheduledStopTime;

    for (let i = 0; i < blocksize; i++) {
      const sampleTime = currentTime + i / sampleRate;

      if (isNumber(startTime) && sampleTime >= startTime && !this.started) {
        this.started = true;
        this.scheduledStartTime = null;
      }

      if (isNumber(stopTime) && sampleTime >= stopTime && this.started) {
        this.started = false;
        this.scheduledStopTime = null;
        this.postEndedMessage(currentTime);
        return false;
      }

      if (!this.started) {
        for (const channel of output) channel[i] = 0.0; // output silence
        continue;
      }

      const bpm = bpmArray?.[i] ?? bpmArray?.[0] ?? 120;
      const beatsPerBar = Math.round(bpbArray?.[i] ?? bpbArray?.[0] ?? 4);
      const rate = Math.max(rateArray?.[i] ?? rateArray?.[0] ?? 1, 0.01);
      const frequency = (bpm / 60) * (rate / beatsPerBar); // beatsPerSecond x cyclesPerBeat
      const phaseOffset = offsetArray?.[i] ?? offsetArray?.[0] ?? 0;
      const scale = scaleArray?.[i] ?? scaleArray?.[0] ?? 0;

      // Calculate sine wave with phase offset
      const dt = frequency / sampleRate;
      const oscValue = oscillators[this.type](
        (this.phase + phaseOffset) % 1.0,
        dt
      );

      for (const channel of output) {
        channel[i] = (this.normalize ? (oscValue + 1) / 2 : oscValue) * scale;
      }

      const phaseIncrement = frequency / sampleRate;
      this.phase += phaseIncrement;
      if (this.phase >= 1.0) this.phase -= 1.0;
    }

    return true;
  }
}

registerProcessor("lfo-processor", LFOProcessor);

export type {
  LfoParameter,
  LfoParameterData,
  LfoProcessorOptions,
  LfoProcessorMessage,
};
