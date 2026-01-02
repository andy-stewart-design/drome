import type { FilterType } from "@/worklets/worklet-filter";

interface SampleNodeOptions extends Omit<AudioBufferSourceOptions, "buffer"> {
  gain?: number;
  filter?: BiquadFilterOptions;
}

class SampleNode {
  private _audioNode: AudioBufferSourceNode | null;
  private _gainNode: GainNode | null;
  private _filterNode: BiquadFilterNode | null;
  private _controller: AbortController;
  private _duration: number;
  private _connected = false;

  constructor(
    ctx: AudioContext,
    buffer: AudioBuffer,
    { gain, filter, ...opts }: SampleNodeOptions
  ) {
    this._audioNode = new AudioBufferSourceNode(ctx, { ...opts, buffer });
    this._gainNode = new GainNode(ctx, { gain });
    this._duration = buffer.duration;
    this._controller = new AbortController();
    this._filterNode = filter ? new BiquadFilterNode(ctx, filter) : null;
  }

  private get audioNode() {
    if (!this._audioNode) {
      throw new Error("[SAMPLE NODE]: Audio Node has been disconnected.");
    }
    return this._audioNode;
  }

  private get gainNode() {
    if (!this._gainNode) {
      throw new Error("[SAMPLE NODE]: Gain Node has been disconnected.");
    }
    return this._gainNode;
  }

  private get filterNode() {
    if (!this._filterNode) {
      throw new Error("[SAMPLE NODE]: Filter Node does not exist.");
    }
    return this._filterNode;
  }

  private createFilter(opts: BiquadFilterOptions) {
    this._filterNode = new BiquadFilterNode(this.ctx, opts);
  }

  connect(destination: AudioNode) {
    if (this._filterNode) {
      this.audioNode
        .connect(this.gainNode)
        .connect(this._filterNode)
        .connect(destination);
    } else {
      this.audioNode.connect(this.gainNode).connect(destination);
    }
    this._connected = true;
  }

  disconnect() {
    this._controller.abort();
    this.audioNode.disconnect();
    this.gainNode.disconnect();
    this._filterNode?.disconnect();
    this._audioNode = null;
    this._gainNode = null;
    this._filterNode = null;
  }

  start(when = 0, offset = 0) {
    this.audioNode.start(
      when,
      Math.min(Math.max(offset, 0), 1) * this._duration
    );
  }

  stop(when = 0) {
    this.audioNode.stop(when ?? this.audioNode.context.currentTime);
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

  setFilterType(type: FilterType) {
    if (type === "none") {
      if (!this._filterNode) return;
      this._filterNode.disconnect(this.gainNode);
      this.audioNode.disconnect(this._filterNode);
      this.audioNode.connect(this.gainNode);
      this._filterNode = null;
    } else if (!this._filterNode) {
      this.createFilter({ type });
      if (this._connected) {
        this.audioNode.disconnect(this.gainNode);
        this.audioNode.connect(this.filterNode).connect(this.gainNode);
      }
    } else {
      this._filterNode.type = type;
    }
  }

  addEventListener(type: string, cb: EventListenerOrEventListenerObject) {
    const { signal } = this._controller;
    this._audioNode?.addEventListener(type, cb, { signal });
  }

  removeEventListener(type: string, cb: EventListenerOrEventListenerObject) {
    this._audioNode?.removeEventListener(type, cb);
  }

  get buffer() {
    return this.audioNode.buffer!; // TODO: replace assertion with a check
  }

  // AUDIO PARAMS
  get detune() {
    return this.audioNode.detune;
  }

  get playbackRate() {
    return this.audioNode.playbackRate;
  }

  get gain() {
    return this.gainNode.gain;
  }

  get filterQ() {
    return this.filterNode.Q;
  }

  get filterFrequency() {
    return this.filterNode.frequency;
  }

  // STATIC VALUES
  get ctx() {
    return this.audioNode.context;
  }

  get connected() {
    return this._connected;
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

  get filterType(): string {
    return this.filterNode.type;
  }

  set filterType(type: FilterType) {
    if (type === "none") {
      if (!this._filterNode) return;
      this._filterNode.disconnect(this.gainNode);
      this.audioNode.disconnect(this._filterNode);
      this.audioNode.connect(this.gainNode);
      this._filterNode = null;
    } else if (!this._filterNode) {
      this.createFilter({ type });
      this.audioNode.disconnect(this.gainNode);
      this.audioNode.connect(this.filterNode).connect(this.gainNode);
    } else {
      this._filterNode.type = type;
    }
  }
}

export default SampleNode;
