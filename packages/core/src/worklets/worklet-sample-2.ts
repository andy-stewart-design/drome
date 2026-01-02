import { isNumber } from "@/utils/validators";

type AudioParam = (typeof audioParams)[number]["name"];
type AudioParams = Record<AudioParam, number>;

interface ProcessorOptions {
  buffer: Float32Array<ArrayBuffer>;
  offset?: number;
  //   type: Waveform;
  //   filterType: FilterType;
}

interface ProcessorInput {
  processorOptions: ProcessorOptions;
}

type ProcessorMessage = {
  type: "ended";
  time: number;
};

const audioParams = [
  { name: "begin", defaultValue: 0, min: 0, max: 3.4028234663852886e38 },
  { name: "end", defaultValue: 0, min: 0, max: 3.4028234663852886e38 },
  { name: "gain", defaultValue: 1, min: 0, max: 3.4028234663852886e38 },
  { name: "detune", defaultValue: 0, min: -153600, max: 153600 },
  { name: "rate", defaultValue: 1, min: 0, max: 3.4028234663852886e38 },
  { name: "loop", defaultValue: 0, min: 0, max: 1 }, // 0=NO, 1=YES
  { name: "loopStart", defaultValue: 0, min: 0, max: 1 },
  { name: "loopEnd", defaultValue: 1, min: 0, max: 1 },
] as const;

class SampleProcessor extends AudioWorkletProcessor {
  private buffer: Float32Array<ArrayBuffer>;
  private readIndex = 0;

  constructor({ processorOptions }: ProcessorInput) {
    super();
    this.buffer = processorOptions.buffer;
    this.readIndex = processorOptions.offset ?? 0;

    this.port.onmessage = ({ data }: MessageEvent) => {
      switch (data.type) {
        case "offset":
          this.readIndex = data.offset;
          break;
      }
    };
  }

  static get parameterDescriptors() {
    return audioParams;
  }

  process(
    _: Float32Array[][],
    outputs: Float32Array[][],
    params: Record<AudioParam, Float32Array>
  ) {
    const begin = params.begin?.[0];
    const end = params.end?.[0];
    const output = outputs[0];
    const channel = output[0];
    const buffer = this.buffer;
    const invSampleRate = 1 / sampleRate;
    const fadeSamples = sampleRate * 0.003; // 3ms
    const gain = params.gain[0];
    const rate = params.rate[0];
    const detune = params.detune[0];
    const detuneFactor = Math.pow(2.0, detune / 1200.0);
    const loop = !!Math.round(params.loop[0]);
    const _loopStart = params.loopStart[0];
    const _loopEnd = params.loopEnd[0];

    const loopStart = _loopStart * buffer.length;
    const loopEnd = _loopEnd * buffer.length;
    const speed = rate * detuneFactor;

    for (let i = 0; i < channel.length; i++) {
      const sampleTime = currentTime + i * invSampleRate;

      if (end > begin && sampleTime > end) {
        for (let j = i; j < channel.length; j++) {
          for (const channel of output) channel[j] = 0.0;
        }
        return false;
      }

      if (sampleTime <= begin) {
        for (const channel of output) channel[i] = 0.0;
        continue;
      }

      const i0 = Math.floor(this.readIndex);
      const frac = this.readIndex - i0;
      const maxIndex = loop ? loopEnd : buffer.length;
      let i1 = i0 + 1;
      if (i1 >= maxIndex) i1 = loop ? loopStart : i0;

      const samp0 = buffer[i0];
      const samp1 = buffer[i1];
      const sample = samp0 + frac * (samp1 - samp0);
      const t = ((sampleTime - begin) * sampleRate) / fadeSamples;
      const amp = Math.max(0, Math.min(1, t));

      for (const channel of output) {
        channel[i] = sample * gain * amp;
      }

      this.readIndex += speed;

      if (loop && this.readIndex >= loopEnd) {
        this.readIndex = loopStart;
      } else if (this.readIndex >= buffer.length) {
        return false;
      }
    }
    return true;
  }
}

registerProcessor("sample-processor", SampleProcessor);

export type { AudioParams, ProcessorOptions, ProcessorMessage };
