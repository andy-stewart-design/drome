import AudioEndedEvent from "@/events/audio-ended";
import type {
  LfoProcessorOptions,
  LfoParameterData,
  LfoProcessorMessage,
} from "@/worklets/worklet-lfo";

type Waveform = "sine" | "sawtooth" | "triangle" | "square";

type LfoOptions = Partial<LfoProcessorOptions & LfoParameterData>;
type LfoNodeMessage =
  | {
      type: "start" | "stop";
      time: number;
      offset?: number;
    }
  | {
      type: "oscillatorType";
      oscillatorType: Waveform;
    }
  | {
      type: "reset";
    }
  | {
      type: "normalize";
      normalize: boolean;
    };

class LfoNode extends AudioWorkletNode {
  private _oscillatorType: Waveform;
  private _started = false;
  private _normalize: boolean;
  readonly frequency: AudioParam;
  readonly scale: AudioParam;
  readonly phaseOffset: AudioParam;
  onended: ((e: AudioEndedEvent) => void) | null = null;

  constructor(
    ctx: AudioContext,
    { type = "sine", normalize = false, ...parameterData }: LfoOptions = {}
  ) {
    super(ctx, "lfo-processor", {
      numberOfOutputs: 1,
      outputChannelCount: [2],
      parameterData,
      processorOptions: { type, normalize },
    });

    this._oscillatorType = type;
    this._normalize = normalize;
    this.frequency = getParam(this, "frequency");
    this.phaseOffset = getParam(this, "phaseOffset");
    this.scale = getParam(this, "scale");

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
  }

  stop(when: number = 0) {
    const time = when === 0 ? this.context.currentTime : when;
    this.postMessage({ type: "stop", time });
  }

  reset() {
    this.postMessage({ type: "reset" });
  }

  normalize(normalize: boolean) {
    this.postMessage({ type: "normalize", normalize });
    this._normalize = normalize;
  }

  setOscillatorType(oscillatorType: Waveform) {
    this._oscillatorType = oscillatorType;
    this.postMessage({ type: "oscillatorType", oscillatorType });
  }

  get type() {
    return this._oscillatorType;
  }

  set type(oscillatorType: Waveform) {
    this._oscillatorType = oscillatorType;
    this.postMessage({ type: "oscillatorType", oscillatorType });
  }

  get started() {
    return this._started;
  }

  get normalized() {
    return this._normalize;
  }
}

export default LfoNode;
export { type LfoNodeMessage };

function getParam(node: AudioWorkletNode, name: string) {
  const param = node.parameters.get(name);
  if (!param) throw new Error(`Missing AudioParam "${name}"`);
  return param;
}
