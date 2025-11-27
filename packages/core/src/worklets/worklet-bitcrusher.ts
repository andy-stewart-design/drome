class BitcrushProcessor extends AudioWorkletProcessor {
  private phase: number;
  private lastSample: number;

  static get parameterDescriptors() {
    return [
      { name: "rateReduction", defaultValue: 1, minValue: 1, maxValue: 128 },
      { name: "bitDepth", defaultValue: 8, minValue: 1, maxValue: 16 },
    ];
  }

  constructor() {
    super();
    this.phase = 0;
    this.lastSample = 0;
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ) {
    const rateParam = parameters.rateReduction;
    const bitsParam = parameters.bitDepth;
    const sourceLimit = Math.min(inputs.length, outputs.length);

    for (let inputNum = 0; inputNum < sourceLimit; inputNum++) {
      const input = inputs[inputNum];
      const output = outputs[inputNum];
      if (!input || !output) return true;

      const chanCount = Math.min(input.length, output.length);

      for (let chanNum = 0; chanNum < chanCount; chanNum++) {
        const inChan = input[chanNum];
        const outChan = output[chanNum];
        if (!inChan || !outChan) return true;

        for (let i = 0; i < inChan.length; i++) {
          const sample = inChan[i];
          const rate = rateParam?.[i] ?? rateParam?.[0] ?? 1;
          const bits = bitsParam?.[i] ?? bitsParam?.[0] ?? 8;
          this.phase++;

          if (!sample) return true;

          if (this.phase >= rate) {
            this.phase = 0;
            const step = Math.pow(0.5, bits);
            this.lastSample = step * Math.floor(sample / step + 0.5);
          }

          outChan[i] = this.lastSample;
        }
      }
    }

    return true;
  }
}

registerProcessor("bitcrush-processor", BitcrushProcessor);
