// TODO: start/stop commands (return false), generally make more consistent with oscillator
// TODO: wrapper audio node

interface LfoProcessorOptions {
  type: keyof typeof oscillators;
}

interface LfoOptions {
  processorOptions: Partial<LfoProcessorOptions>;
}

const parameterDescriptors = [
  { name: "frequency", defaultValue: 2, minValue: 0.01, maxValue: 100 },
  { name: "phaseOffset", defaultValue: 0, minValue: 0, maxValue: 1 },
  { name: "scale", defaultValue: 0, minValue: 0, maxValue: 20000 },
];

const oscillators = {
  sine: (p: number) => Math.sin(2.0 * Math.PI * p),
  sawtooth: (p: number) => 2.0 * p - 1.0,
  triangle: (p: number) => (p < 0.5 ? 4.0 * p - 1.0 : 3.0 - 4.0 * p),
  square: (p: number) => (p < 0.5 ? 1.0 : -1.0),
};

class LFOProcessor extends AudioWorkletProcessor {
  private type: keyof typeof oscillators;
  private phase: number;

  static get parameterDescriptors() {
    return parameterDescriptors;
  }

  constructor({ processorOptions }: LfoOptions) {
    super();
    this.phase = 0;
    this.type = processorOptions.type ?? "sine";
    this.port.onmessage = (e) => {
      if (e.data.type === "reset") {
        this.phase = 0;
      } else if (e.data.type === "oscillatorType") {
        this.type = e.data.oscillatorType;
      }
    };
  }

  process(
    _: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ) {
    const output = outputs[0];
    const frequencyArray = parameters.frequency;
    const offsetArray = parameters.phaseOffset;
    const scale = parameters.scale;
    const blocksize = output?.[0]?.length ?? 0;

    if (!output || !frequencyArray || !offsetArray || !scale) {
      return true;
    }

    for (let i = 0; i < blocksize; i++) {
      const currentFreq = frequencyArray?.[i] ?? frequencyArray?.[0] ?? 440;
      const currentPhaseOffset = offsetArray?.[i] ?? offsetArray?.[0] ?? 0;
      const currentScale = scale?.[i] ?? scale?.[0] ?? 0;

      // Calculate sine wave with phase offset
      const sineValue = oscillators[this.type](
        (this.phase + currentPhaseOffset) % 1.0
      );

      for (const channel of output) {
        channel[i] = sineValue * currentScale;
      }

      const phaseIncrement = currentFreq / sampleRate;

      this.phase += phaseIncrement;
      if (this.phase >= 1.0) this.phase -= 1.0;
    }

    return true;
  }
}

registerProcessor("lfo-processor", LFOProcessor);
