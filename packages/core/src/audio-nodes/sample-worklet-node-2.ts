import AudioEndedEvent from "@/events/audio-ended";
import type {
  AudioParams,
  ProcessorOptions,
  ProcessorMessage,
} from "@/worklets/worklet-sample-2";

type SampleNodeMessage =
  | {
      type: "buffer";
      buffer: Float32Array<ArrayBuffer>;
    }
  | {
      type: "offset";
      offset: number;
    };

type Params = Omit<AudioParams, "loop"> & { loop: boolean; offset: number };

class SampleNode extends AudioWorkletNode {
  private _duration: number;
  private _begin: AudioParam;
  private _end: AudioParam;
  private _loop: AudioParam;
  private _loopStart: AudioParam;
  private _loopEnd: AudioParam;
  readonly playbackRate: AudioParam;
  readonly detune: AudioParam;
  readonly gain: AudioParam;
  onended: ((e: AudioEndedEvent) => void) | null = null;

  constructor(
    ctx: AudioContext,
    buffer: AudioBuffer,
    { loop, offset = 0, ...params }: Partial<Params> = {}
  ) {
    super(ctx, "sample-processor", {
      numberOfOutputs: 1,
      outputChannelCount: [2],
      parameterData: { loop: loop ? 1 : 0, ...params },
      processorOptions: { buffer: buffer.getChannelData(0), offset },
    });

    this._duration = buffer.duration;

    this._begin = getParam(this, "begin");
    this._end = getParam(this, "end");
    this._loop = getParam(this, "loop");
    this._loopStart = getParam(this, "loopStart");
    this._loopEnd = getParam(this, "loopEnd");
    this.playbackRate = getParam(this, "rate");
    this.detune = getParam(this, "detune");
    this.gain = getParam(this, "gain");

    // Listen for messages from the processor
    this.port.onmessage = (event: MessageEvent<ProcessorMessage>) => {
      if (event.data.type === "ended") {
        const audioEvent = new AudioEndedEvent(event.data.time);
        this.onended?.(audioEvent);
        this.dispatchEvent(audioEvent);
      }
    };
  }

  private postMessage(msg: SampleNodeMessage) {
    this.port.postMessage(msg);
  }

  start(when = 0, offset = 0) {
    const startTime = when === 0 ? this.context.currentTime : when;
    const clampedOffset = Math.max(
      0,
      Math.min(offset * this._duration, this._duration)
    );

    this._begin.value = startTime;
    this.postMessage({
      type: "offset",
      offset: clampedOffset * this.context.sampleRate,
    });
  }

  stop(when: number = 0) {
    const stopTime = when === 0 ? this.context.currentTime : when;
    this._end.value = stopTime;
  }

  setLoop(loop: boolean) {
    this._loop.value = loop ? 1 : 0;
  }

  setLoopStart(loopStart: number) {
    this._loopStart.value = loopStart;
  }

  setLoopEnd(loopEnd: number) {
    this._loopEnd.value = loopEnd;
  }

  get loop() {
    return !!Math.round(this._loop.value);
  }

  set loop(loop: boolean) {
    this._loop.value = loop ? 1 : 0;
  }

  get loopStart() {
    return this._loopStart.value;
  }

  set loopStart(loopStart: number) {
    this._loopStart.value = loopStart;
  }

  get loopEnd() {
    return this._loopEnd.value;
  }

  set loopEnd(loopEnd: number) {
    this._loopEnd.value = loopEnd;
  }

  get stopTime() {
    return this._end.value;
  }
}

function getParam(node: AudioWorkletNode, name: string) {
  const param = node.parameters.get(name);
  if (!param) throw new Error(`Missing AudioParam "${name}"`);
  return param;
}

export default SampleNode;
export type { SampleNodeMessage };
