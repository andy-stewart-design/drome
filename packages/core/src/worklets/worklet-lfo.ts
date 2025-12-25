// TODO: start/stop commands (return false), generally make more consistent with oscillator
// TODO: more waveforms
// TODO: wrapper audio node

const isNumber = (v: unknown) => typeof v === "number";

const parameterDescriptors = [
  { name: "frequency", defaultValue: 2, minValue: 0.01, maxValue: 100 },
  { name: "phaseOffset", defaultValue: 0, minValue: 0, maxValue: 1 },
  { name: "baseValue", defaultValue: 0.5, minValue: 0, maxValue: 1 },
  { name: "amount", defaultValue: 0.5, minValue: 0, maxValue: 1 },
];

const oscillators = {
  sine: (p: number) => Math.sin(2.0 * Math.PI * p),
  sawtooth: (p: number) => 2.0 * p - 1.0,
  triangle: (p: number) => (p < 0.5 ? 4.0 * p - 1.0 : 3.0 - 4.0 * p),
  square: (p: number) => (p < 0.5 ? 1.0 : -1.0),
};

class LFOProcessor extends AudioWorkletProcessor {
  private phase: number;

  static get parameterDescriptors() {
    return parameterDescriptors;
  }

  constructor() {
    super();
    this.phase = 0;
    this.port.onmessage = (e) => {
      if (e.data.type === "reset") this.phase = 0;
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
    const baseValue = parameters.baseValue;
    const amount = parameters.amount;
    const blocksize = output?.[0]?.length ?? 0;

    if (!output || !frequencyArray || !offsetArray || !baseValue || !amount) {
      return true;
    }

    for (let i = 0; i < blocksize; i++) {
      const currentFreq = frequencyArray?.[i] ?? frequencyArray?.[0] ?? 440;
      const currentPhaseOffset = offsetArray?.[i] ?? offsetArray?.[0] ?? 0;
      const currentBase = baseValue.length > 1 ? baseValue[i] : baseValue[0];
      const currentAmount = amount.length > 1 ? amount[i] : amount[0];

      if (
        !isNumber(currentFreq) ||
        !isNumber(currentPhaseOffset) ||
        !isNumber(currentBase) ||
        !isNumber(currentAmount)
      ) {
        return true;
      }

      // Calculate sine wave with phase offset
      const sineValue = oscillators["square"](
        (this.phase + currentPhaseOffset) % 1.0
      );

      for (const channel of output) {
        channel[i] = currentBase + sineValue * currentAmount;
      }

      const baseFrequency = frequencyArray?.[i] ?? frequencyArray?.[0] ?? 440;
      const phaseIncrement = baseFrequency / sampleRate;

      this.phase += phaseIncrement;
      if (this.phase >= 1.0) this.phase -= 1.0;
    }

    return true;
  }
}

registerProcessor("lfo-processor", LFOProcessor);
