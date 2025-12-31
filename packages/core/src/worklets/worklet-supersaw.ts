import { isNumber } from "@/utils/validators";

const INVSR = 1 / sampleRate;
const TWO_PI = 2 * Math.PI;

const frac = (x: number) => x - Math.floor(x);

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

const pv = (arr: Float32Array<ArrayBufferLike> | undefined, n: number) =>
  arr?.[n] ?? arr?.[0];

const applySemitoneDetuneToFrequency = (frequency: number, detune: number) => {
  return frequency * Math.pow(2, detune / 12);
};

const getDetuner = (unison: number, detune: number) => {
  if (unison < 2) {
    return (_voiceIdx: number) => 0;
  }
  const scale = detune / (unison - 1);
  const center = detune * 0.5;
  return (voiceIdx: number) => voiceIdx * scale - center;
};

function polyBlep(phase: number, dt: number) {
  dt = Math.min(dt, 1 - dt);
  const invdt = 1 / dt;
  // Start of cycle
  if (phase < dt) {
    phase *= invdt;
    return 2 * phase - phase ** 2 - 1;
  }
  // End of cycle
  else if (phase > 1 - dt) {
    phase = (phase - 1) * invdt;
    return phase ** 2 + 2 * phase + 1;
  }
  // 0 otherwise
  else {
    return 0;
  }
}
// The order is important for dough integration
const waveshapes = {
  tri(phase: number, skew = 0.5) {
    const x = 1 - skew;
    if (phase >= skew) {
      return 1 / x - phase / x;
    }
    return phase / skew;
  },
  sine(phase: number) {
    return Math.sin(TWO_PI * phase) * 0.5 + 0.5;
  },
  ramp(phase: number) {
    return phase;
  },
  saw(phase: number) {
    return 1 - phase;
  },

  square(phase: number, skew = 0.5) {
    if (phase >= skew) {
      return 0;
    }
    return 1;
  },
  custom(phase: number, values = [0, 1]) {
    const numParts = values.length - 1;
    const currPart = Math.floor(phase * numParts);

    const partLength = 1 / numParts;
    const startVal = clamp(values[currPart] ?? 0, 0, 1);
    const endVal = clamp(values[currPart + 1] ?? 0, 0, 1);
    const y2 = endVal;
    const y1 = startVal;
    const x1 = 0;
    const x2 = partLength;
    const slope = (y2 - y1) / (x2 - x1);
    return slope * (phase - partLength * currPart) + startVal;
  },
  sawblep(phase: number, dt: number) {
    const v = 2 * phase - 1;
    return v - polyBlep(phase, dt);
  },
};

class SuperSawOscillatorProcessor extends AudioWorkletProcessor {
  private phase: number[];

  constructor() {
    super();
    this.phase = [];
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
        name: "panspread",
        defaultValue: 0.4,
        min: 0,
        max: 1,
      },
      {
        name: "freqspread",
        defaultValue: 0.2,
        min: 0,
      },
      {
        name: "detune",
        defaultValue: 0,
        min: 0,
      },

      {
        name: "voices",
        defaultValue: 5,
        min: 1,
        automationRate: "k-rate",
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

    if (!isNumber(begin) || !isNumber(end)) {
      throw new Error("Something has gone wrong");
    }
    if (currentTime >= end) return false; // should terminate
    if (currentTime <= begin) return true; // keep alive

    const output = outputs[0];
    const channel = output?.[0];
    const voices = params.voices?.[0]; // k-rate

    if (!output || !channel || !isNumber(voices)) {
      throw new Error("Something has gone wrong");
    }

    for (let i = 0; i < channel.length; i++) {
      const detune = pv(params.detune, i) ?? 0;
      const freqspread = pv(params.freqspread, i) ?? 0.2;
      const panspread = (pv(params.panspread, i) ?? 0.4) * 0.5 + 0.5;
      let freq = pv(params.frequency, i) ?? 440;
      let gainL = Math.sqrt(1 - panspread);
      let gainR = Math.sqrt(panspread);
      // Main detuning
      freq = applySemitoneDetuneToFrequency(freq, detune / 100);
      const detuner = getDetuner(voices, freqspread);
      for (let n = 0; n < voices; n++) {
        let currentPhase = this.phase[n];
        let outL = output[0]?.[i];
        let outR = output[1]?.[i];
        if (!isNumber(currentPhase) || !isNumber(outL) || !isNumber(outR)) {
          throw new Error("Something has gone wrong");
        }

        // Individual voice detuning
        const freqVoice = applySemitoneDetuneToFrequency(freq, detuner(n));
        // We must wrap this here because it is passed into sawblep below which
        // has domain [0, 1]
        const dt = frac(freqVoice * INVSR);
        currentPhase = this.phase[n] ?? Math.random();
        const v = waveshapes.sawblep(currentPhase, dt);

        outL += v * gainL;
        outR += v * gainR;

        let pn = currentPhase + dt;
        if (pn >= 1.0) pn -= 1.0;
        this.phase[n] = pn;
        // invert right and left gain
        const tmp = gainL;
        gainL = gainR;
        gainR = tmp;
      }
    }
    return true;
  }
}

registerProcessor("supersaw-oscillator", SuperSawOscillatorProcessor);
