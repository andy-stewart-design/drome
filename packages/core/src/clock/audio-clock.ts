// inspired by: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques

import type { DromeEventCallback, DromeEventType, Metronome } from "@/types.js";

class AudioClock {
  static lookahead = 25.0; // How frequently to call scheduling function (in milliseconds)
  static scheduleAheadTime = 0.1; // How far ahead to schedule audio (sec)

  readonly ctx = new AudioContext();
  readonly metronome: Metronome = { beat: 0, bar: 0 };
  private _paused = true;
  private _bpm = 120;

  private _barStart = 0.0;
  private _nextBeatStart = 0.0;
  private timerID: ReturnType<typeof setTimeout> | null = null;
  private listeners: Map<DromeEventType, DromeEventCallback[]> = new Map();

  constructor(bpm = 120) {
    this.bpm(bpm);
  }

  private schedule() {
    const { scheduleAheadTime } = AudioClock;
    while (this._nextBeatStart < this.ctx.currentTime + scheduleAheadTime) {
      this.metronome.beat = (this.metronome.beat + 1) % 4;

      if (this.metronome.beat === 0) {
        this.metronome.bar++;
        this._barStart = this._nextBeatStart;
        // console.log(this.barStartTime);
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

  public on(eventType: DromeEventType, listener: DromeEventCallback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(listener);
  }

  public off(eventType: DromeEventType, listener: DromeEventCallback) {
    const arr = this.listeners.get(eventType);
    if (!arr) return;
    const idx = arr.indexOf(listener);
    if (idx !== -1) arr.splice(idx, 1);
  }

  public cleanup() {
    this.stop();
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
