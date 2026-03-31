import AudioEndedEvent from "@/events/audio-ended";
import { getParam } from "@/utils/audio-params";
import {
  workletIds,
  type AudioParamName,
  type AudioParamData,
  type SupersawProcessorMessage,
} from "@drome/audio-worklets";

type SupersawOptions = Partial<AudioParamData>;

class SupersawNode extends AudioWorkletNode {
  private _startTime: AudioParam;
  private _stopTime: AudioParam;
  readonly _voices: AudioParam;
  readonly frequency: AudioParam;
  readonly detune: AudioParam;
  readonly freqspread: AudioParam;
  readonly panspread: AudioParam;
  onended: ((e: AudioEndedEvent) => void) | null = null;

  constructor(ctx: AudioContext, parameterData: SupersawOptions = {}) {
    super(ctx, workletIds.supersaw, {
      numberOfOutputs: 1,
      outputChannelCount: [2],
      parameterData,
    });

    this._startTime = getParam<AudioParamName>(this, "start");
    this._stopTime = getParam<AudioParamName>(this, "stop");
    this._voices = getParam<AudioParamName>(this, "voices");
    this.frequency = getParam<AudioParamName>(this, "frequency");
    this.detune = getParam<AudioParamName>(this, "detune");
    this.freqspread = getParam<AudioParamName>(this, "freqspread");
    this.panspread = getParam<AudioParamName>(this, "panspread");

    this.port.onmessage = (event: MessageEvent<SupersawProcessorMessage>) => {
      if (event.data.type === "ended") {
        const audioEvent = new AudioEndedEvent(event.data.time);
        this.onended?.(audioEvent);
        this.dispatchEvent(audioEvent);
      }
    };
  }

  start(when: number = 0) {
    this._startTime.value = when;
  }

  stop(when: number = 0) {
    this._stopTime.value = when;
  }

  voices(n: number) {
    this._voices.value = n;
  }

  get startTime() {
    return this._startTime.value;
  }

  get stopTime() {
    return this._stopTime.value;
  }
}

export default SupersawNode;
