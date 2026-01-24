import MIDIObservable from "./midi-observable";
import MIDIRouter from "./midi-router";
import MIDIObserver, { type MIDIObserverType } from "./midi-observer";
import { getMIDIPort } from "./utils";

class MIDIController {
  private _midi: MIDIAccess;
  private _observables: Map<string, MIDIObservable<any>>;
  private _routers: Map<string, Set<MIDIRouter>>;
  private _cachedValues: Map<string, number>;

  private constructor(midi: MIDIAccess) {
    this._midi = midi;
    this._observables = new Map();
    this._routers = new Map();
    this._cachedValues = new Map();
  }

  static async init() {
    const midi = await navigator.requestMIDIAccess();
    return new MIDIController(midi);
  }

  // ——————————————————————————————————————————————————————————————————
  // Observer (input) methods
  addObserver<T extends MIDIObserverType>(observer: MIDIObserver<T>) {
    const { identifier } = observer;
    const port = getMIDIPort(this.midi.inputs, identifier);
    const input = observer.type === "portchange" ? this._midi : port;
    if (!input) return null;

    let observable = this._observables.get(identifier);

    if (!observable) {
      observable = new MIDIObservable<T>(input);
      this._observables.set(identifier, observable);
    }

    observer.controller(this);
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

  cacheValue(id: string, value: number) {
    this._cachedValues.set(id, value);
  }

  // ——————————————————————————————————————————————————————————————————
  // Router (output) methods
  createRouter(identifier: string) {
    const port = getMIDIPort(this.midi.outputs, identifier);
    if (!port) return null;

    let routerSet = this._routers.get(identifier);
    if (!routerSet) {
      routerSet = new Set();
      this._routers.set(identifier, routerSet);
    }

    const router = new MIDIRouter(port);
    routerSet.add(router);

    return router;
  }

  removeRouter(router: MIDIRouter) {
    const { identifier } = router;
    if (!this._routers.has(identifier)) return;

    this._routers.get(identifier)?.delete(router);
    router.destroy();
  }

  clearRouters() {
    this._routers.forEach((set) => {
      set.forEach((r) => r.destroy());
      set.clear();
    });
    this._routers.clear();
  }

  // ——————————————————————————————————————————————————————————————————
  // General methods
  destroy() {
    this._observables.forEach((obs) => obs.destroy());
    this._observables.clear();
    this._cachedValues.clear();
  }

  get midi() {
    return this._midi;
  }

  get cachedValues() {
    return this._cachedValues;
  }

  get inputs() {
    return Array.from(this._midi.inputs.values());
  }

  get outputs() {
    return Array.from(this._midi.outputs.values());
  }

  get observables() {
    return Array.from(this._observables.values());
  }

  get obserableCount() {
    return this._observables.size;
  }

  get observers() {
    return Array.from(this._observables.values()).flatMap((observable) => {
      return Array.from(observable.subscribers.values());
    });
  }

  get observerCount() {
    return Array.from(this._observables.values()).reduce((acc, obs) => {
      return acc + obs.subscribers.size;
    }, 0);
  }
}

export default MIDIController;
export { MIDIController, MIDIObserver };

// class TypedMap<T extends Record<PropertyKey, any>> {
//   private map = new Map<keyof T, T[keyof T]>();

//   get<K extends keyof T>(key: K): T[K] | undefined {
//     return this.map.get(key) as T[K] | undefined;
//   }

//   set<K extends keyof T>(key: K, value: T[K]): void {
//     this.map.set(key, value);
//   }
// }

// interface MyMap {
//   foo: string[];
//   bar: number[];
// }

// const myMap = new TypedMap<MyMap>();

// myMap.set("foo", ["a", "b"]);
// myMap.set("bar", [1, 2, 3]);

// const foo = myMap.get("bar"); // string[] | undefined
// const bar = myMap.get("bar"); // number[] | undefined
