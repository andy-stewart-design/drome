import * as algos from "@/utils/distortion-algorithms.js";
import { clamp } from "@/utils/math.js";
import { DISTORTION_ID } from "@/constants.js";
import type { DistortionAlgorithm, DistortionFunction } from "@/types.js";

interface DistortionOptions extends AudioWorkletNodeOptions {
  processorOptions: {
    algorithm?: DistortionAlgorithm;
  };
}

class DistortionProcessor extends AudioWorkletProcessor {
  private algorithm: DistortionFunction;
  private started: boolean;

  static get parameterDescriptors() {
    return [
      { name: "distortion", defaultValue: 0, minValue: 0, maxValue: 100 },
      { name: "postgain", defaultValue: 1, minValue: 0, maxValue: 1 },
    ];
  }

  constructor({ processorOptions }: DistortionOptions) {
    super();

    const { algorithm = "sigmoid" } = processorOptions ?? {};

    this.algorithm = algos[algorithm];
    this.started = false;
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ) {
    const postgainParam = parameters.postgain;
    const distortionParam = parameters.distortion;
    const sourceLimit = Math.min(inputs.length, outputs.length);

    for (let inputNum = 0; inputNum < sourceLimit; inputNum++) {
      const input = inputs[inputNum];
      const output = outputs[inputNum];

      const hasInput = !(input?.[0] === undefined);
      if (this.started && !hasInput) return false;
      this.started = hasInput;

      if (!input || !output) return true;

      const chanCount = Math.min(input.length, output.length);

      for (let chanNum = 0; chanNum < chanCount; chanNum++) {
        const inChan = input[chanNum];
        const outChan = output[chanNum];
        if (!inChan || !outChan) return true;

        for (let i = 0; i < inChan.length; i++) {
          const sample = inChan[i];
          const _postgain = postgainParam?.[i] ?? postgainParam?.[0] ?? 1;
          const postgain = clamp(_postgain, 0.001, 1);
          const distortion = distortionParam?.[i] ?? distortionParam?.[0] ?? 0;
          const shape = Math.expm1(distortion);

          if (sample) outChan[i] = postgain * this.algorithm(sample, shape);
        }
      }
    }

    return true;
  }
}

registerProcessor(DISTORTION_ID, DistortionProcessor);

export { DistortionProcessor };
