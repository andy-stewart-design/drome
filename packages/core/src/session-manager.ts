import AudioClock from "./clock/audio-clock";
import LfoNode from "@/automation/lfo-node";
import MIDIController, { MIDIObserver } from "./midi";
import Sample from "@/instruments/sample";
import Synth from "./instruments/synth";
import type { DromeEventCallback, DromeEventType, SNEL } from "@/types";

type LogCallback = (log: string, logs: string[]) => void;

interface ListenerMap {
  log: Set<LogCallback>;
  clock: {
    internal: Set<() => boolean>;
    external: Set<() => boolean>;
  };
}
type QueueCallback =
  | { type: "log"; fn: LogCallback }
  | { type: "clock"; fnType: DromeEventType; fn: DromeEventCallback };
type QueueInput = Synth | Sample | LfoNode | MIDIObserver<any> | QueueCallback;

interface Queue {
  instruments: Set<Synth | Sample>;
  lfos: Set<LfoNode>;
  observers: Set<MIDIObserver<any>>;
  listeners: Partial<{
    log: Set<LogCallback>;
    clock: Map<DromeEventCallback, DromeEventType>;
  }>;
}

class SessionManager {
  readonly _clock: AudioClock;
  private _midi: MIDIController | null;

  private _queue: Partial<Queue> | null;
  private _instruments: Set<Synth | Sample>;
  private _lfos: Set<LfoNode>;
  private readonly _listeners: ListenerMap;

  static async init() {
    const manager = new SessionManager();
    const midiPermissions = await manager.checkMidiPermissions();
    if (midiPermissions === "granted") {
      await manager.createMidiController();
    }
    return manager;
  }

  constructor() {
    this._clock = new AudioClock();
    this._midi = null;
    this._queue = null;
    this._instruments = new Set();
    this._lfos = new Set();
    this._listeners = {
      log: new Set(),
      clock: { internal: new Set(), external: new Set() },
    };
  }

  enqueue(input: QueueInput) {
    if (!this._queue) this._queue = {};

    if (input instanceof LfoNode) {
      if (!this._queue.lfos) this._queue.lfos = new Set();
      this._queue.lfos.add(input);
    } else if (input instanceof MIDIObserver) {
      if (!this._queue.observers) this._queue.observers = new Set();
      this._queue.observers.add(input);
    } else if (input instanceof Synth || input instanceof Sample) {
      if (!this._queue.instruments) this._queue.instruments = new Set();
      this._queue.instruments.add(input);
    } else if (input.type === "clock") {
      if (!this._queue.listeners) this._queue.listeners = {};
      if (!this._queue.listeners.clock) this._queue.listeners.clock = new Map();
      this._queue.listeners.clock.set(input.fn, input.fnType);
    } else if (input.type === "log") {
      if (!this._queue.listeners) this._queue.listeners = {};
      if (!this._queue.listeners.log) this._queue.listeners.log = new Set();
      this._queue.listeners.log.add(input.fn);
    }
  }

  precommit() {
    if (this._queue) {
      this._instruments.forEach((inst) =>
        inst.stop(this._clock.nextBarStartTime),
      );
      this._instruments.clear();
      this.cleanupLfos(this._clock.nextBarStartTime);
      this._midi?.clearObservers();
      this._listeners.clock.external.forEach((fn) => fn());
      this._listeners.clock.external.clear();
      this._listeners.log.clear();
    }
  }

  commit() {
    if (!this._queue) return;
    if (this._queue.instruments) {
      this._instruments = this._queue.instruments;
    }
    if (this._queue.lfos) {
      this._lfos = this._queue.lfos;
    }
    if (this._queue.observers && this._midi) {
      this._queue.observers.forEach((obs) => this._midi?.addObserver(obs));
    }
    if (this._queue.listeners?.log) {
      this._listeners.log = this._queue.listeners.log;
    }
    if (this._queue.listeners?.clock) {
      this._queue.listeners.clock.forEach((type, fn) => {
        const clockCb = this._clock.on(type, fn);
        this._listeners.clock.external.add(clockCb);
      });
    }
    this._queue = null;
  }

  start() {
    this._clock.start();
  }

  stop(when = 0.25) {
    this._clock.stop();
    // cleanup instruments
    this._instruments.forEach((inst) => {
      inst.onDestroy = () => this._instruments.delete(inst);
      inst.stop(this._clock.ctx.currentTime, when);
    });
    // cleanup lfos
    this.cleanupLfos(this._clock.ctx.currentTime + when);
    // cleanup midi
    this._midi?.clearObservers();
    this._midi?.clearRouters();
    // cleanup listeners
    this._listeners.clock.external.forEach((fn) => fn());
    this._listeners.clock.external.clear();
    this._listeners.log.clear();
  }

  suspend() {
    this._clock.ctx.suspend();
  }

  async checkMidiPermissions() {
    const permissions = await navigator.permissions.query({ name: "midi" });
    return permissions.state;
  }

  async createMidiController() {
    try {
      const midi = await MIDIController.init();
      this._midi = midi;
      return midi;
    } catch (e) {
      console.warn(e);
      return null;
    }
  }

  cleanupLfos(when: number) {
    this._lfos.forEach((lfo) => {
      const clear = () => {
        lfo.disconnect();
        lfo.removeEventListener("ended", clear);
        this._lfos.delete(lfo);
      };
      lfo.addEventListener("ended", clear);
      lfo.stop(when);
    });
  }

  get clock() {
    return this._clock;
  }

  get queue() {
    return this._queue;
  }

  get instruments() {
    return this._instruments;
  }

  get lfos() {
    return this._lfos;
  }

  get midi() {
    return this._midi;
  }

  get listeners() {
    return this._listeners;
  }
}

export default SessionManager;
export type { ListenerMap, QueueInput };
