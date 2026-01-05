export type SupersawProcessorMessage = { type: "ended"; time: number };
export type AudioParamName = (typeof audioParams)[number]["name"];
export type AudioParamData = Record<AudioParamName, number>;
export type SupersawOptions = Partial<Omit<AudioParamData, "start" | "stop">>;

const MAX_VOICES = 8;

const audioParams = [
  { name: "start", defaultValue: 0, max: Number.POSITIVE_INFINITY, min: 0 },
  { name: "stop", defaultValue: 0, max: Number.POSITIVE_INFINITY, min: 0 },
  { name: "frequency", defaultValue: 440, minValue: 20, maxValue: 20000 },
  { name: "panspread", defaultValue: 0.4, min: 0, max: 1 },
  { name: "freqspread", defaultValue: 0.2, min: 0, max: 1 },
  { name: "detune", defaultValue: 0, minValue: -153600.0, maxValue: 153600.0 },
  { name: "voices", defaultValue: 7, min: 1, max: 8, automationRate: "k-rate" },
] as const;

class SuperSawOscillatorProcessor extends AudioWorkletProcessor {
  private phase: Float32Array;

  constructor() {
    super();
    this.phase = new Float32Array(MAX_VOICES);
    for (let i = 0; i < this.phase.length; i++) {
      this.phase[i] = Math.random();
    }
  }

  static get parameterDescriptors() {
    return audioParams;
  }

  postEndedMessage(time: number) {
    const msg: SupersawProcessorMessage = { type: "ended", time };
    this.port.postMessage(msg);
  }

  process(
    _: Float32Array[][],
    outputs: Float32Array[][],
    params: Record<AudioParamName, Float32Array>,
  ) {
    const startTime = params.start[0];
    const stopTime = params.stop[0];

    if (currentTime <= startTime) return true;

    const output = outputs[0];
    const outL = output[0];
    const outR = output[1];
    const blocksize = outL.length;
    const voices = Math.min(Math.max(params.voices[0], 2), this.phase.length);
    const _freq = getParam(params, "frequency");
    const _detune = getParam(params, "detune");
    const _freqSpr = getParam(params, "freqspread");
    const _panSpr = getParam(params, "panspread");

    for (let i = 0; i < blocksize; i++) {
      const sampleTime = currentTime + i / sampleRate;

      if (sampleTime >= stopTime) {
        this.postEndedMessage(currentTime);
        return false;
      }

      let freq = _freq.static ? _freq.value : _freq.at(i);
      const detune = _detune.static ? _detune.value : _detune.at(i);
      const freqspread = _freqSpr.static ? _freqSpr.value : _freqSpr.at(i);
      const panspread = _panSpr.static ? _panSpr.value : _panSpr.at(i);

      freq = freq * Math.pow(2, detune / 100 / 12);
      const detuner = getDetuner(voices, freqspread);

      let gainL = Math.sqrt(1 - panspread);
      let gainR = Math.sqrt(panspread);

      for (let v = 0; v < voices; v++) {
        const phase = this.phase[v];
        const voiceFrequency = freq * Math.pow(2, detuner(v) / 12);
        const dt = frac(voiceFrequency / sampleRate);
        const sample = sawblep(phase, dt);

        outL[i] += sample * gainL;
        outR[i] += sample * gainR;
        this.phase[v] = (phase + dt) % 1;
        [gainL, gainR] = [gainR, gainL]; // Swap pan for next voice
      }
    }
    return true;
  }
}

registerProcessor("supersaw-processor", SuperSawOscillatorProcessor);

// Helper functions

function getParam(
  params: Record<AudioParamName, Float32Array>,
  key: AudioParamName,
) {
  const arr = params[key];
  return {
    at: (i: number) => arr[i],
    value: arr[0],
    static: arr.length === 1,
  };
}

function getDetuner(voices: number, detune: number) {
  const scale = detune / (voices - 1);
  const center = detune * 0.5;
  return (i: number) => i * scale - center;
}

function frac(x: number) {
  return x - Math.floor(x);
}

function polyBlep(phase: number, dt: number) {
  if (phase < dt) {
    const p = phase / dt;
    return 2 * p - p * p - 1;
  }
  const limit = 1 - dt;
  if (phase > limit) {
    const p = (phase - 1) / dt;
    return p * p + 2 * p + 1;
  }
  return 0;
}

const sawblep = (phase: number, dt: number) => {
  return 2 * phase - 1 - polyBlep(phase, dt);
};
