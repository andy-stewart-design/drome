import AudioEndedEvent from "@/events/audio-ended";
import type { BasicWaveform } from "@/types";
import type {
  LfoProcessorOptions,
  LfoParameterData,
  LfoProcessorMessage,
} from "@/worklets/worklet-lfo";

type LfoOptions = Partial<
  LfoProcessorOptions &
    LfoParameterData & {
      baseValue: number;
    }
>;
type LfoParams = keyof LfoParameterData;
type LfoNodeMessage =
  | {
      type: "start" | "stop" | "reset";
      time?: number;
      offset?: number;
    }
  | {
      type: "oscillatorType";
      oscillatorType: BasicWaveform;
    }
  | {
      type: "normalize";
      normalize: boolean;
    };

class LfoNode extends AudioWorkletNode {
  private _oscillatorType: BasicWaveform;
  private _started = false;
  private _normalize: boolean;
  readonly baseValue: number;
  readonly bpmParam: AudioParam;
  readonly bpbParam: AudioParam;
  readonly rateParam: AudioParam;
  readonly frequencyParam: AudioParam;
  readonly scaleParam: AudioParam;
  readonly phaseOffsetParam: AudioParam;
  onended: ((e: AudioEndedEvent) => void) | null = null;
  norm: (normalize: boolean) => this;
  off: (phaseOffset: number) => this;

  constructor(
    ctx: AudioContext,
    {
      type = "sine",
      baseValue = 0,
      normalize = false,
      ...parameterData
    }: LfoOptions = {},
  ) {
    super(ctx, "lfo-processor", {
      numberOfOutputs: 1,
      outputChannelCount: [2],
      parameterData,
      processorOptions: { type, normalize },
    });

    this._oscillatorType = type;
    this._normalize = normalize;
    this.baseValue = baseValue;
    this.bpmParam = getParam<LfoParams>(this, "beatsPerMinute");
    this.bpbParam = getParam<LfoParams>(this, "beatsPerBar");
    this.rateParam = getParam<LfoParams>(this, "rate");
    this.frequencyParam = getParam<LfoParams>(this, "frequency");
    this.phaseOffsetParam = getParam<LfoParams>(this, "phaseOffset");
    this.scaleParam = getParam<LfoParams>(this, "scale");
    this.norm = this.normalize.bind(this);
    this.off = this.offset.bind(this);

    // Listen for messages from the processor
    this.port.onmessage = (event: MessageEvent<LfoProcessorMessage>) => {
      if (event.data.type === "ended") {
        const audioEvent = new AudioEndedEvent(event.data.time);
        this.onended?.(audioEvent);
        this.dispatchEvent(audioEvent);
      }
    };
  }

  private postMessage(msg: LfoNodeMessage) {
    this.port.postMessage(msg);
  }

  start(when: number = 0) {
    this._started = true;
    const time = when === 0 ? this.context.currentTime : when;
    this.postMessage({ type: "start", time });
    return this;
  }

  stop(when: number = 0) {
    const time = when === 0 ? this.context.currentTime : when;
    this.postMessage({ type: "stop", time });
    return this;
  }

  bpm(bpm: number) {
    this.bpmParam.value = bpm;
    return this;
  }

  rate(rate: number) {
    this.rateParam.value = rate;
    return this;
  }

  normalize(normalize: boolean = true) {
    this.postMessage({ type: "normalize", normalize });
    this._normalize = normalize;
    return this;
  }

  offset(phaseOffset: number) {
    this.phaseOffsetParam.value = phaseOffset;
    return this;
  }

  reset(when: number = 0) {
    const time = when === 0 ? this.context.currentTime : when;
    this.postMessage({ type: "reset", time });
    return this;
  }

  scale(scale: number) {
    this.scaleParam.value = scale;
    return this;
  }

  type(oscillatorType: Waveform) {
    this._oscillatorType = oscillatorType;
    this.postMessage({ type: "oscillatorType", oscillatorType });
    return this;
  }

  get waveform() {
    return this._oscillatorType;
  }

  get started() {
    return this._started;
  }

  get normalized() {
    return this._normalize;
  }

  get currentRate() {
    return this.rateParam.value;
  }
}

export default LfoNode;
export { type LfoNodeMessage };

function getParam<T extends string & {}>(node: AudioWorkletNode, name: T) {
  const param = node.parameters.get(name);
  if (!param) throw new Error(`Missing AudioParam "${name}"`);
  return param;
}
