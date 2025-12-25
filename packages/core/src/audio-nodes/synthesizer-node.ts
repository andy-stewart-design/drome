import AudioEndedEvent from "@/events/audio-ended";
import type { FilterType } from "@/worklets/worklet-filter";
import type {
  SynthesizerProcessorOptions,
  SynthesizerParameterData,
  SynthesizerProcessorMessage,
} from "@/worklets/worklet-synthesizer";

type SynthesizerWaveform = "sine" | "sawtooth" | "triangle" | "square";
type SynthesizerParamSubset = Omit<SynthesizerParameterData, "type">;

type SynthesizerOptions = Partial<
  SynthesizerProcessorOptions &
    SynthesizerParamSubset & { type: SynthesizerWaveform | number }
>;
type SynthesizerNodeMessage =
  | {
      type: "start" | "stop";
      time: number;
      offset?: number;
    }
  | {
      type: "filterType";
      filterType: FilterType;
    }
  | {
      type: "oscillatorType";
      oscillatorType: SynthesizerWaveform;
    };

class SynthesizerNode extends AudioWorkletNode {
  private _filterType: FilterType;
  private _oscillatorType: SynthesizerWaveform;
  readonly frequency: AudioParam;
  readonly detune: AudioParam;
  readonly gain: AudioParam;
  readonly filterFrequency: AudioParam;
  readonly filterQ: AudioParam;
  onended: ((e: AudioEndedEvent) => void) | null = null;

  constructor(
    ctx: AudioContext,
    { filterType = "none", type = "sine", ...params }: SynthesizerOptions = {}
  ) {
    super(ctx, "custom-oscillator-processor", {
      numberOfOutputs: 1,
      outputChannelCount: [2],
      parameterData: { ...params, type: getOscillatorType(type) },
      processorOptions: { filterType, type },
    });

    this._oscillatorType = type;
    this._filterType = filterType;
    this.frequency = getParam(this, "frequency");
    this.detune = getParam(this, "detune");
    this.gain = getParam(this, "gain");
    this.filterFrequency = getParam(this, "filterFrequency");
    this.filterQ = getParam(this, "filterQ");

    // Listen for messages from the processor
    this.port.onmessage = (
      event: MessageEvent<SynthesizerProcessorMessage>
    ) => {
      if (event.data.type === "ended") {
        const audioEvent = new AudioEndedEvent(event.data.time);
        this.onended?.(audioEvent);
        this.dispatchEvent(audioEvent);
      }
    };
  }

  private postMessage(msg: SynthesizerNodeMessage) {
    this.port.postMessage(msg);
  }

  start(when: number = 0) {
    const startTime = when === 0 ? this.context.currentTime : when;
    this.postMessage({ type: "start", time: startTime });
  }

  stop(when: number = 0) {
    const stopTime = when === 0 ? this.context.currentTime : when;
    this.postMessage({ type: "stop", time: stopTime });
  }

  setOscillatorType(oscillatorType: SynthesizerWaveform) {
    this._oscillatorType = oscillatorType;
    this.postMessage({ type: "oscillatorType", oscillatorType });
  }

  setFilterType(filterType: FilterType) {
    this._filterType = filterType;
    this.postMessage({ type: "filterType", filterType });
  }

  get oscillatorType() {
    return this._oscillatorType;
  }

  set oscillatorType(oscillatorType: SynthesizerWaveform) {
    this._oscillatorType = oscillatorType;
    this.postMessage({ type: "oscillatorType", oscillatorType });
  }

  get filterType() {
    return this._filterType;
  }

  set filterType(filterType: FilterType) {
    this._filterType = filterType;
    this.postMessage({ type: "filterType", filterType });
  }
}

function getParam(node: AudioWorkletNode, name: string) {
  const param = node.parameters.get(name);
  if (!param) throw new Error(`Missing AudioParam "${name}"`);
  return param;
}

export default SynthesizerNode;

export type { SynthesizerNodeMessage };

function getOscillatorType(type: SynthesizerWaveform | number) {
  const typeMap = { sine: 0, sawtooth: 1, triangle: 2, square: 3 };
  return typeof type === "number"
    ? Math.min(Math.max(type, 0), 3)
    : typeMap[type];
}
