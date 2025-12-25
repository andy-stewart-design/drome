import type { SynthesizerNodeMessage } from "@/audio-nodes/synthesizer-node";
import FilterProcessor, { type FilterType } from "./worklet-filter";
import { isNullish } from "@/utils/validators";

interface SynthesizerProcessorOptions {
  type: Waveform;
  filterType: FilterType;
}

type SynthesizerParameter = (typeof parameterDescriptors)[number]["name"];
type SynthesizerParameterData = Record<SynthesizerParameter, number>;

interface SynthesizerOptions {
  processorOptions: Partial<SynthesizerProcessorOptions>;
}

type SynthesizerProcessorMessage = {
  type: "ended";
  time: number;
};

type Waveform = keyof typeof oscillators;

const parameterDescriptors = [
  {
    name: "frequency",
    automationRate: "a-rate",
    defaultValue: 440.0,
    minValue: 20.0,
    maxValue: 20000.0,
  },
  {
    name: "detune",
    automationRate: "a-rate",
    defaultValue: 0.0,
    minValue: -153600.0,
    maxValue: 153600.0,
  },
  {
    name: "gain",
    automationRate: "a-rate",
    defaultValue: 1.0,
    minValue: 0.0,
    maxValue: 3.4028234663852886e38,
  },
  {
    name: "filterFrequency",
    automationRate: "k-rate",
    defaultValue: 20000.0,
    minValue: 20.0,
    maxValue: 20000.0,
  },
  {
    name: "filterQ",
    automationRate: "k-rate",
    defaultValue: 0.707,
    minValue: 0.001,
    maxValue: 30.0,
  },
] as const;

const oscillators = {
  sine: (p: number) => Math.sin(2.0 * Math.PI * p),
  sawtooth: (p: number) => 2.0 * p - 1.0,
  triangle: (p: number) => (p < 0.5 ? 4.0 * p - 1.0 : 3.0 - 4.0 * p),
  square: (p: number) => (p < 0.5 ? 1.0 : -1.0),
};

class SynthesizerProcessor extends FilterProcessor {
  type: Waveform;
  phase = 0.0;
  started = false;
  scheduledStartTime: number | null = null;
  scheduledStopTime: number | null = null;

  static get parameterDescriptors() {
    return parameterDescriptors;
  }

  constructor({ processorOptions }: SynthesizerOptions) {
    super();
    this.updateFilterCoefficients(20000.0, 0.707);
    this.type = processorOptions.type ?? "sine";
    this.filterType = processorOptions.filterType ?? "none";

    this.port.onmessage = ({ data }: MessageEvent<SynthesizerNodeMessage>) => {
      switch (data.type) {
        case "start":
          this.scheduledStartTime = data.time || currentTime;
          this.phase = 0.0;
          break;
        case "stop":
          this.scheduledStopTime = data.time || currentTime;
          break;
        case "filterType":
          this.filterType = data.filterType || "none";
          break;
        case "oscillatorType":
          this.type = data.oscillatorType;
          break;
      }
    };
  }

  postEndedMessage(time: number) {
    const msg: SynthesizerProcessorMessage = { type: "ended", time };
    this.port.postMessage(msg);
  }

  process(
    _: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ) {
    const output = outputs[0];
    const frequencyArray = parameters.frequency;
    const detuneArray = parameters.detune;
    const gainArray = parameters.gain;
    const filterFrequencyArray = parameters.filterFrequency;
    const filterQArray = parameters.filterQ;

    // Update filter coefficients (k-rate, so once per block)
    const filterFreq = filterFrequencyArray?.[0];
    const filterQ = filterQArray?.[0];

    if (!output || isNullish(filterFreq) || isNullish(filterQ)) {
      return true;
    }

    const blocksize = output?.[0]?.length ?? 0;
    const safeFreq = Math.max(20, Math.min(filterFreq, sampleRate * 0.45));
    const safeQ = Math.max(0.001, filterQ);
    this.updateFilterCoefficients(safeFreq, safeQ);

    for (let i = 0; i < blocksize; i++) {
      const sampleTime = currentTime + i / sampleRate;

      if (
        !isNullish(this.scheduledStartTime) &&
        sampleTime >= this.scheduledStartTime &&
        !this.started
      ) {
        this.started = true;
        this.scheduledStartTime = null;
      }

      if (
        !isNullish(this.scheduledStopTime) &&
        sampleTime >= this.scheduledStopTime &&
        this.started
      ) {
        this.started = false;
        this.scheduledStopTime = null;
        this.postEndedMessage(currentTime);
        return false;
      }

      if (!this.started) {
        for (let channel = 0; channel < output.length; channel++) {
          const target = output[channel];
          if (target) target[i] = 0.0;
        }
        continue;
      }

      const gain = gainArray?.[i] ?? gainArray?.[0] ?? 1;

      // Generate Sawtooth Waveform and apply gain
      const sample = oscillators[this.type](this.phase) * gain;

      for (const [j, channel] of output.entries()) {
        // Apply filter if enabled, otherwise pass through
        if (this.filterType === "none") channel[i] = sample;
        else channel[i] = this.applyFilter(sample, j);
      }

      const baseFrequency = frequencyArray?.[i] ?? frequencyArray?.[0] ?? 440;
      const detuneCents = detuneArray?.[i] ?? detuneArray?.[0] ?? 0;
      const detuneFactor = Math.pow(2.0, detuneCents / 1200.0);
      const phaseIncrement = (baseFrequency * detuneFactor) / sampleRate;

      this.phase += phaseIncrement;
      if (this.phase >= 1.0) this.phase -= 1.0;
    }

    return true;
  }
}

registerProcessor("custom-oscillator-processor", SynthesizerProcessor);

export default SynthesizerProcessor;
export type {
  SynthesizerParameter,
  SynthesizerParameterData,
  SynthesizerProcessorOptions,
  SynthesizerProcessorMessage,
};
