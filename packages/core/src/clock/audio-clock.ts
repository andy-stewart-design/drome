// inspired by: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques

import type { DromeEventCallback, DromeEventType, Metronome } from "@/types.js";

type ListenerMap = Map<DromeEventType, Set<DromeEventCallback>>;

class AudioClock {
  static lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
  static scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)
  static lookaheadOffset = 0.1;

  readonly ctx: AudioContext;
  readonly metronome: Metronome = { beat: 0, bar: 0 };
  private _timeOrigin: number;
  private _paused = true;
  private _bpm = 120;

  private _barStart = 0.0;
  private _nextBeatStart = 0.0;
  private _preEventFired = false;
  private timerID: ReturnType<typeof setTimeout> | null = null;
  private listeners: ListenerMap = new Map();

  constructor(ctx: AudioContext, bpm = 120) {
    this.ctx = ctx;
    this._timeOrigin = performance.now() - this.ctx.currentTime * 1000;
    this.bpm(bpm);
  }

  private schedule() {
    const { scheduleAheadTime, lookaheadOffset } = AudioClock;
    const timeUntilNextBeat = this._nextBeatStart - this.ctx.currentTime;

    if (!this._preEventFired && timeUntilNextBeat <= lookaheadOffset) {
      const nextBeat = (this.metronome.beat + 1) % 4;
      const nextBar =
        nextBeat === 0 ? this.metronome.bar + 1 : this.metronome.bar;

      // Fire preBeat
      this.listeners
        .get("prebeat")
        ?.forEach((cb) =>
          cb({ beat: nextBeat, bar: nextBar }, this._nextBeatStart),
        );

      // Fire preBar if the next beat is 0
      if (nextBeat === 0) {
        this.listeners
          .get("prebar")
          ?.forEach((cb) =>
            cb({ beat: nextBeat, bar: nextBar }, this._nextBeatStart),
          );
      }

      this._preEventFired = true;
    }

    while (this._nextBeatStart < this.ctx.currentTime + scheduleAheadTime) {
      this._preEventFired = false;
      this.metronome.beat = (this.metronome.beat + 1) % 4;

      if (this.metronome.beat === 0) {
        this.metronome.bar++;
        this._barStart = this._nextBeatStart;

        this.listeners.get("bar")?.forEach((cb) => {
          cb({ ...this.metronome }, this._barStart);
        });
      }

      this.listeners.get("beat")?.forEach((cb) => {
        cb({ ...this.metronome }, this._nextBeatStart);
      });

      this._nextBeatStart += 60.0 / this._bpm;
    }

    this.timerID = setTimeout(this.schedule.bind(this), AudioClock.lookahead);
  }

  public async start() {
    if (!this._paused) return;
    if (this.ctx.state === "suspended") {
      console.log("audio context is suspended", this.ctx.state);
      await this.ctx.resume();
    }
    this.metronome.bar = -1;
    this.metronome.beat = -1;
    this._nextBeatStart = this.ctx.currentTime;
    this._timeOrigin = performance.now() - this.ctx.currentTime * 1000;
    this.schedule();
    this._paused = false;

    this.listeners.get("start")?.forEach((cb) => {
      cb(this.metronome, this._nextBeatStart);
    });
  }

  public pause() {
    if (!this.timerID) return;
    clearTimeout(this.timerID);
    this._paused = true;
    this.listeners.get("pause")?.forEach((cb) => {
      cb(this.metronome, this.ctx.currentTime);
    });
  }

  public stop() {
    this.listeners.get("stop")?.forEach((cb) => {
      cb(this.metronome, this.ctx.currentTime);
    });

    this.pause();
    this.metronome.bar = 0;
    this.metronome.beat = 0;
    this._nextBeatStart = 0;
  }

  public bpm(bpm: number) {
    if (bpm > 0) this._bpm = bpm;
  }

  public audioTimeToMIDITime(audioTimeSeconds: number) {
    return this._timeOrigin + audioTimeSeconds * 1000;
  }

  public on(type: DromeEventType, fn: DromeEventCallback) {
    let listenerGroup = this.listeners.get(type);
    if (!listenerGroup) {
      listenerGroup = new Set();
      this.listeners.set(type, listenerGroup);
    }
    listenerGroup.add(fn);
    return () => listenerGroup.delete(fn);
  }

  public off(type: DromeEventType, fn: DromeEventCallback) {
    const listenerSet = this.listeners.get(type);
    if (listenerSet?.has(fn)) listenerSet.delete(fn);
  }

  public destroy() {
    this.stop();
    this.listeners.forEach((map) => map.clear());
    this.listeners.clear();
    if (this.timerID) {
      clearTimeout(this.timerID);
      this.timerID = null;
    }
  }

  get paused() {
    return this._paused;
  }

  get beatsPerMin() {
    return this._bpm;
  }

  get beatDuration() {
    return 60.0 / this._bpm;
  }

  get beatStartTime() {
    return this._nextBeatStart;
  }

  get nextBeatStartTime() {
    return this._nextBeatStart + this.beatDuration;
  }

  get barStartTime() {
    return this._barStart;
  }

  get nextBarStartTime() {
    return this._barStart + this.barDuration;
  }

  get barDuration() {
    return this.beatDuration * 4;
  }
}

export default AudioClock;
export type { Metronome };
