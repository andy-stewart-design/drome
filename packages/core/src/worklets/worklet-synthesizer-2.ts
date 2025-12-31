import { isNumber } from "@/utils/validators";

// The order is important for dough integration
const waveshapes = {
  triangle(phase: number, skew = 0.5) {
    const x = 1 - skew;
    if (phase >= skew) {
      return 1 / x - phase / x;
    }
    return phase / skew;
  },
  sine(phase: number) {
    return Math.sin(2 * Math.PI * phase) * 0.5 + 0.5;
  },
  sawtooth(phase: number) {
    return 1 - phase;
  },
  square(phase: number, skew = 0.5) {
    if (phase >= skew) {
      return 0;
    }
    return 1;
  },
};

class SynthProcessor extends AudioWorkletProcessor {
  private phase = 0;
  private type: keyof typeof waveshapes;

  constructor() {
    super();
    this.phase = 0;
    this.type = "sine";
  }

  static get parameterDescriptors() {
    return [
      {
        name: "begin",
        defaultValue: 0,
        max: Number.POSITIVE_INFINITY,
        min: 0,
      },
      {
        name: "end",
        defaultValue: 0,
        max: Number.POSITIVE_INFINITY,
        min: 0,
      },
      {
        name: "frequency",
        defaultValue: 440,
        min: Number.EPSILON,
      },
      {
        name: "gain",
        defaultValue: 1,
        min: 0,
        max: 100,
      },
      {
        name: "detune",
        defaultValue: 0,
        min: 0,
      },
    ];
  }
  process(
    _: Float32Array[][],
    outputs: Float32Array[][],
    params: Record<string, Float32Array>
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
      let frequency = params.frequency?.[i] ?? params.frequency?.[0] ?? 440;
      let detune = params.detune?.[i] ?? params.detune?.[0] ?? 0;
      let gain = params.gain?.[i] ?? params.gain?.[0] ?? 0;

      let outL = output[0];
      let outR = output[1];

      if (!outL || !outR) {
        throw new Error("Something has gone wrong bar");
      }

      if (end > begin && sampleTime > end) return false; // should terminate
      if (sampleTime <= begin) {
        outL.fill(0);
        outR.fill(0);
        return true;
      }

      const detuneFactor = Math.pow(2.0, detune / 1200.0);
      const dt = (frequency * detuneFactor) / sampleRate;
      const v = waveshapes[this.type](this.phase, dt);

      outL[i] = v * gain;
      outR[i] = v * gain;

      let pn = this.phase + dt;
      if (pn >= 1.0) pn -= 1.0;
      this.phase = pn;
    }
    return true;
  }
}

registerProcessor("synth-oscillator", SynthProcessor);
