import CompositeAudioNode, { type CompositeAudioNodeOptions, } from "./composite-audio-node";

type SynthNodeOptions = CompositeAudioNodeOptions & OscillatorOptions;

class SynthNode extends CompositeAudioNode<OscillatorNode> {
  protected _audioNode: OscillatorNode | null;

  constructor(ctx: AudioContext, { gain, filter, ...opts }: SynthNodeOptions) {
    super(ctx, { gain, filter });
    this._audioNode = new OscillatorNode(ctx, opts);
  }

  start(when = 0) {
    this._startTime = when;
    this.audioNode.start(when);
  }

  setType(type: OscillatorType) {
    this.audioNode.type = type;
  }

  get type() {
    return this.audioNode.type;
  }

  set type(type: OscillatorType) {
    this.audioNode.type = type;
  }
}

export default SynthNode;
