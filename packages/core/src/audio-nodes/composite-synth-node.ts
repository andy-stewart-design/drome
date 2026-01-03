import CompositeAudioNode, { type CompositeAudioNodeOptions, } from "./composite-audio-node";
import SupersawNode from "./supersaw-worklet-node";

type OscType = "sawtooth" | "sine" | "square" | "supersaw" | "triangle";
type Foo = Omit<OscillatorOptions, "type"> & { type: OscType };
type SynthNodeOptions = CompositeAudioNodeOptions & Foo;

class SynthNode extends CompositeAudioNode<OscillatorNode | SupersawNode> {
  protected _audioNode: OscillatorNode | SupersawNode | null;

  constructor(
    ctx: AudioContext,
    { gain, filter, type, ...opts }: SynthNodeOptions,
  ) {
    super(ctx, { gain, filter });
    if (type === "supersaw") {
      this._audioNode = new SupersawNode(ctx, { frequency: opts.frequency });
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

  get type(): OscType {
    if (!this.isSupersaw(this.audioNode)) {
      return this.audioNode.type as OscType;
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
