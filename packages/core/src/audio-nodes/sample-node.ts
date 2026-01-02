import CompositeAudioNode, {
  type CompositeAudioNodeOptions,
} from "./composite-audio-node";

type SampleNodeOptions = CompositeAudioNodeOptions &
  Omit<AudioBufferSourceOptions, "buffer">;

class SampleNode extends CompositeAudioNode<AudioBufferSourceNode> {
  protected _audioNode: AudioBufferSourceNode | null;
  private _duration: number;

  constructor(
    ctx: AudioContext,
    buffer: AudioBuffer,
    { gain, filter, ...opts }: SampleNodeOptions
  ) {
    super(ctx, { gain, filter });
    this._audioNode = new AudioBufferSourceNode(ctx, { ...opts, buffer });
    this._duration = buffer.duration;
  }

  start(when = 0, offset = 0) {
    this._startTime = when;
    this.audioNode.start(
      when,
      Math.min(Math.max(offset, 0), 1) * this._duration
    );
  }

  setLoop(n: boolean) {
    this.audioNode.loop = n;
  }

  setLoopStart(n: number) {
    this.audioNode.loopStart = n;
  }

  setLoopEnd(n: number) {
    this.audioNode.loopEnd = n;
  }

  // AUDIO PARAMS
  get playbackRate() {
    return this.audioNode.playbackRate;
  }

  // STATIC VALUES
  get buffer() {
    return this.audioNode.buffer;
  }

  get duration() {
    return this._duration;
  }

  get loop() {
    return this.audioNode.loop;
  }

  set loop(n: boolean) {
    this.audioNode.loop = n;
  }

  get loopStart() {
    return this.audioNode.loopStart;
  }

  set loopStart(n: number) {
    this.audioNode.loopStart = n;
  }

  get loopEnd() {
    return this.audioNode.loopEnd;
  }

  set loopEnd(n: number) {
    this.audioNode.loopEnd = n;
  }
}

export default SampleNode;
