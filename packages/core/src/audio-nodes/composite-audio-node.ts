import type { FilterType } from "@/types";
import type SupersawNode from "./supersaw-worklet-node";

type FilterOptions = Omit<BiquadFilterOptions, "type"> & { type: FilterType };

interface CompositeAudioNodeOptions {
  gain?: number;
  filter?: FilterOptions;
}

abstract class CompositeAudioNode<
  T extends OscillatorNode | SupersawNode | AudioBufferSourceNode,
> {
  protected abstract _audioNode: T | null;
  protected _gainNode: GainNode | null;
  protected _filterNode: BiquadFilterNode | null;
  protected _controller: AbortController | null;
  protected _connected = false;
  protected _startTime = 0;
  protected _stopTime = 0;

  constructor(ctx: AudioContext, { gain, filter }: CompositeAudioNodeOptions) {
    this._gainNode = new GainNode(ctx, { gain });
    this._controller = new AbortController();
    this._filterNode = filter ? new BiquadFilterNode(ctx, filter) : null;
  }

  abstract start(when?: number, offset?: number): void;

  protected get audioNode() {
    if (!this._audioNode) {
      throw new Error(
        `[${this.nodeType.toLocaleUpperCase()} NODE]: audio node has been disconnected.`,
      );
    }
    return this._audioNode;
  }

  protected get gainNode() {
    if (!this._gainNode) {
      throw new Error(
        `[${this.nodeType.toLocaleUpperCase()} NODE]: gain node has been disconnected.`,
      );
    }
    return this._gainNode;
  }

  protected get filterNode() {
    if (!this._filterNode) {
      throw new Error(
        `[${this.nodeType.toLocaleUpperCase()} NODE]: filter node has not been set or has been disconnected.`,
      );
    }
    return this._filterNode;
  }

  protected get controller() {
    if (!this._controller) {
      throw new Error(
        `[${this.nodeType.toLocaleUpperCase()} NODE]: abort controller has not been initialized.`,
      );
    }
    return this._controller;
  }

  protected createFilter(opts: BiquadFilterOptions) {
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
    this.audioNode.disconnect();
    this.gainNode.disconnect();
    this._filterNode?.disconnect();
    this._connected = false;
  }

  destory() {
    this.controller.abort();
    this._controller = null;
    this._audioNode = null;
    this._gainNode = null;
    this._filterNode = null;
    this._startTime = 0;
    this._stopTime = 0;
    this._connected = false;
  }

  stop(when = 0) {
    this._stopTime = when;
    this.audioNode.stop(when);
  }

  setFilterType(type: FilterType | "none") {
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
    const { signal } = this.controller;
    this.audioNode.addEventListener(type, cb, { signal });
  }

  removeEventListener(type: string, cb: EventListenerOrEventListenerObject) {
    this.audioNode.removeEventListener(type, cb);
  }

  // AUDIO PARAMS
  get detune() {
    return this._audioNode?.detune;
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

  get nodeType() {
    return this.audioNode instanceof OscillatorNode ? "synth" : "sample";
  }

  get filterType(): string {
    return this.filterNode.type;
  }

  get connected() {
    return this._connected;
  }

  get startTime() {
    return this._startTime;
  }

  get stopTime() {
    return this._stopTime;
  }

  set filterType(type: FilterType | "none") {
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

export default CompositeAudioNode;
export type { CompositeAudioNodeOptions };
