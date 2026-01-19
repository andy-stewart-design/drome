import MIDIObservable from "./midi-observable-2";
import MIDIObserver, { type MIDIObserverType } from "./midi-observer";
import { getMIDIPort } from "./utils";

class MIDIController {
  private _midi: MIDIAccess;
  private _observables: Map<string, MIDIObservable<any>>;

  private constructor(midi: MIDIAccess) {
    this._midi = midi;
    this._observables = new Map();
  }

  static async init() {
    const midi = await navigator.requestMIDIAccess();
    return new MIDIController(midi);
  }

  addObserver<T extends MIDIObserverType>(observer: MIDIObserver<T>) {
    if (observer.type === "portchange") {
      const observable = new MIDIObservable<T>(this._midi);
      const { identifier } = observer;
      this._observables.set(identifier, observable);
      observable.subscribe(observer);
    } else {
      const { identifier } = observer;
      const port = getMIDIPort(this.midi.inputs, identifier);
      if (!port) return null;

      let observable = this._observables.get(identifier);
      if (!observable) {
        observable = new MIDIObservable<T>(port);
        this._observables.set(identifier, observable);
      }
      observable.subscribe(observer);
    }
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
    this._observables.forEach((obs) => obs.destroy());
    this._observables.clear();
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
