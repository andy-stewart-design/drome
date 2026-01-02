type SupersawProcessorMessage = { type: "ended"; time: number };

const INVSR = 1 / sampleRate;
const frac = (x: number) => x - Math.floor(x);

const applySemitoneDetuneToFrequency = (frequency: number, detune: number) => {
  return frequency * Math.pow(2, detune / 12);
};

const getDetuner = (unison: number, detune: number) => {
  if (unison < 2) return (_: number) => 0;
  const scale = detune / (unison - 1);
  const center = detune * 0.5;
  return (i: number) => i * scale - center;
};

function polyBlep(phase: number, dt: number) {
  dt = Math.min(dt, 1 - dt);
  const invdt = 1 / dt;
  if (phase < dt) {
    phase *= invdt;
    return 2 * phase - phase ** 2 - 1;
  } else if (phase > 1 - dt) {
    phase = (phase - 1) * invdt;
    return phase ** 2 + 2 * phase + 1;
  }
  return 0;
}

const sawblep = (phase: number, dt: number) => {
  return 2 * phase - 1 - polyBlep(phase, dt);
};

class SuperSawOscillatorProcessor extends AudioWorkletProcessor {
  private phase: number[];

  constructor() {
    super();
    this.phase = [];
  }

  static get parameterDescriptors() {
    return [
      { name: "begin", defaultValue: 0, max: Number.POSITIVE_INFINITY, min: 0 },
      { name: "end", defaultValue: 0, max: Number.POSITIVE_INFINITY, min: 0 },
      {
        name: "frequency",
        defaultValue: 440,
        minValue: 20.0,
        maxValue: 20000.0,
      },
      { name: "panspread", defaultValue: 0.4, min: 0, max: 1 },
      { name: "freqspread", defaultValue: 0.2, min: 0 },
      { name: "detune", defaultValue: 0, min: 0 },
      { name: "voices", defaultValue: 5, min: 1, automationRate: "k-rate" },
    ];
  }

  postEndedMessage(time: number) {
    const msg: SupersawProcessorMessage = { type: "ended", time };
    this.port.postMessage(msg);
  }

  process(
    _: Float32Array[][],
    outputs: Float32Array[][],
    params: Record<string, Float32Array>,
  ) {
    const startTime = params.begin[0];
    const stopTime = params.end[0];

    if (currentTime <= startTime) return true;

    const output = outputs[0];
    const blocksize = output[0].length;
    const voices = params.voices[0];

    for (let i = 0; i < blocksize; i++) {
      const sampleTime = currentTime + i / sampleRate;

      if (sampleTime >= stopTime) {
        this.postEndedMessage(currentTime);
        return false;
      }

      let freq = params.frequency[i] ?? params.frequency[0];
      const detune = params.detune[i] ?? params.detune[0];
      const freqspread = params.freqspread[i] ?? params.freqspread[0];
      const panspread = params.panspread[i] ?? params.panspread[0];

      freq = applySemitoneDetuneToFrequency(freq, detune / 100);
      const detuner = getDetuner(voices, freqspread);

      let gainL = Math.sqrt(1 - panspread);
      let gainR = Math.sqrt(panspread);

      for (let n = 0; n < voices; n++) {
        const phase = this.phase[n] ?? Math.random();
        const freqVoice = applySemitoneDetuneToFrequency(freq, detuner(n));
        const dt = frac(freqVoice * INVSR);
        const v = sawblep(phase, dt);

        output[0][i] += v * gainL * 0.25;
        output[1][i] += v * gainR * 0.25;

        let p = phase + dt;
        if (p >= 1) p -= 1;
        this.phase[n] = p;

        const t = gainL;
        gainL = gainR;
        gainR = t;
      }
    }
    return true;
  }
}

registerProcessor("supersaw-oscillator", SuperSawOscillatorProcessor);
