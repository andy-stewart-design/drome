import type { SupersawOptions } from "@/worklets/worklet-supersaw";
import CompositeAudioNode, {
  type CompositeAudioNodeOptions,
} from "./composite-audio-node";
import SupersawNode from "./supersaw-worklet-node";
import type { Waveform } from "@/types";

type BaseOscillatorOptions = Omit<OscillatorOptions, "type"> & {
  type: Waveform;
} & SupersawOptions;
type SynthNodeOptions = CompositeAudioNodeOptions & BaseOscillatorOptions;

class SynthNode extends CompositeAudioNode<OscillatorNode | SupersawNode> {
  protected _audioNode: OscillatorNode | SupersawNode | null;

  constructor(
    ctx: AudioContext,
    { gain, filter, type, voices, ...opts }: SynthNodeOptions,
  ) {
    super(ctx, { gain, filter });
    if (type === "supersaw") {
      this._audioNode = new SupersawNode(ctx, {
        frequency: opts.frequency,
        voices,
      });
    } else {
      this._audioNode = new OscillatorNode(ctx, { ...opts, type });
    }
  }

  private isSupersaw(node: OscillatorNode | SupersawNode | null) {
    return node instanceof SupersawNode;
  }

  start(when = 0) {
    this._startTime = when;
    this.audioNode.start(when);
  }

  setType(type: OscillatorType) {
    if (!this.isSupersaw(this.audioNode)) this.audioNode.type = type;
  }

  get type(): Waveform {
    if (!this.isSupersaw(this.audioNode)) {
      return this.audioNode.type as Waveform;
    }
    return "supersaw";
  }

  set type(type: OscillatorType) {
    if (!this.isSupersaw(this.audioNode)) {
      this.audioNode.type = type;
    }
  }
}

export default SynthNode;
