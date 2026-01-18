import MIDIObservable from "./midi-observable";
import MIDIObserver, { type MIDIObserverType } from "./midi-observer";
import type {
  MIDIControllerListeners,
  InputChangeHandler,
  OutputChangeHandler,
} from "./types";
import { getMIDIPort } from "./utils";

class MIDIController {
  private _midi: MIDIAccess;
  // private _activePorts: MIDIControllerPorts;
  private _listeners: MIDIControllerListeners;
  private _observables: Map<string, MIDIObservable<any>>;

  private constructor(midi: MIDIAccess) {
    this._midi = midi;
    this._listeners = { inputs: new Set(), outputs: new Set() };
    this._observables = new Map();
    this.midi.addEventListener("statechange", this._emit.bind(this));
  }

  static async init() {
    const midi = await navigator.requestMIDIAccess();
    return new MIDIController(midi);
  }

  private _emit(e: MIDIConnectionEvent) {
    if (e.port?.type === "input") {
      const inputs = Array.from(this.midi.inputs.values());
      this._listeners.inputs.forEach((fn) => fn(inputs));
    } else if (e.port?.type === "output") {
      const outputs = Array.from(this.midi.outputs.values());
      this._listeners.outputs.forEach((fn) => fn(outputs));
    }
  }

  onInputChange(fn: InputChangeHandler) {
    this._listeners.inputs.add(fn);
  }

  onOututChange(fn: OutputChangeHandler) {
    this._listeners.outputs.add(fn);
  }

  addObserver<T extends MIDIObserverType>(observer: MIDIObserver<T>) {
    const { identifier } = observer;
    const port = getMIDIPort(this.midi.inputs, identifier);
    if (!port) return null;

    let observable = this._observables.get(identifier);
    if (!observable) {
      observable = new MIDIObservable<T>(port);
      this._observables.set(identifier, observable);
    }
    observable.subscribe(observer);
    return this;
  }

  removeObserver<T extends MIDIObserverType>(observer: MIDIObserver<T>) {
    const { identifier } = observer;
    this._observables.get(identifier)?.unsubscribe(observer);
  }

  clearObservers() {
    this._observables.forEach((obs) => obs.unsubscribeAll());
  }

  destroy() {
    this.midi.removeEventListener("statechange", this._emit.bind(this));
    this._listeners.inputs.clear();
    this._listeners.outputs.clear();
  }

  get midi() {
    return this._midi;
  }

  get inputs() {
    return Array.from(this._midi.inputs.values());
  }

  get outputs() {
    return Array.from(this._midi.outputs.values());
  }
}

export default MIDIController;
