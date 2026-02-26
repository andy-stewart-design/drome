import { map } from "@/utils/math";
import { isArray, isNumber } from "@/utils/validators";
import type MIDIController from "./index";
import type {
  MIDIControlMessage,
  MIDINoteMessage,
  MIDIPortChange,
} from "./types";

interface MIDIObserverDataMap {
  note: MIDINoteMessage;
  controlchange: MIDIControlMessage;
  portchange: MIDIPortChange;
}

type MIDIObserverType = keyof MIDIObserverDataMap;
type UpdateCallback<T extends MIDIObserverType> = (
  data: MIDIObserverDataMap[T],
) => void;

class MIDIOberserver<T extends MIDIObserverType> {
  private _controller: MIDIController | undefined;
  private _type: T;
  private _identifier: string; // port name or id
  private _channels: number[] = [1];
  private _updaters: Set<UpdateCallback<T>>;
  private _currentValue: number;
  private _min: number | undefined;
  private _max: number | undefined;

  constructor(type: T, ident?: string, defaultValue = 0) {
    if ((type === "note" || type === "controlchange") && !ident) {
      console.error("[MIDI Observer]: must provide a port id or name.");
    }

    this._type = type;
    this._identifier = ident ?? type;
    this._currentValue = defaultValue;
    this._updaters = new Set();
  }

  channel(n: number | number[]) {
    this._channels.length = 0;
    if (!isArray(n)) this._channels.push(n);
    else this._channels.push(...n);
    return this;
  }

  value(n?: number) {
    if (typeof n === "number") this._currentValue = n;
  }

  controller(controller: MIDIController) {
    this._controller = controller;
    const value = this._controller.cachedValues.get(this.identifier);
    if (value) this._currentValue = value;
  }

  onUpdate(fn: (data: MIDIObserverDataMap[T]) => void) {
    this._updaters.add(fn);
    return this;
  }

  update(data: MIDIObserverDataMap[T]) {
    if (!this._updaters.size) {
      console.warn("[MIDIObserver]: update function is undefined");
    }

    if (data.type === "controlchange") {
      if (isNumber(this._min) && isNumber(this._max)) {
        const mappedValue = map(data.value, 0, 127, this._min, this._max);
        const mappedData = { ...data, value: mappedValue };
        this._currentValue = mappedData.value;
        this._controller?.cacheValue(this.identifier, this._currentValue);
        this._updaters.forEach((fn) => fn(mappedData));
      } else {
        this._currentValue = data.value;
        this._controller?.cacheValue(this.identifier, this._currentValue);
        this._updaters.forEach((fn) => fn(data));
      }
    } else {
      this._updaters.forEach((fn) => fn(data));
    }
  }

  clear() {
    this._updaters.clear();
  }

  range(min: number, max: number) {
    this._min = min;
    this._max = max;
    return this;
  }

  isType<K extends MIDIObserverType>(type: K): this is MIDIOberserver<K> {
    return this._type === (type as any);
  }

  destroy() {
    this._updaters.clear();
    this._controller = undefined;
    this._channels.length = 0;
    this._currentValue = 0;
    this._identifier = "";
    this._min = undefined;
    this._max = undefined;
  }

  get channels() {
    return this._channels;
  }

  get currentValue() {
    return this._currentValue;
  }

  get defaultValue() {
    return this._currentValue;
  }

  get identifier() {
    return this._identifier;
  }

  set type(type: T) {
    this._type = type;
  }

  get type() {
    return this._type;
  }
}

// const noteData: MIDINoteMessage = {
//   type: "noteoff",
//   source: {
//     name: "iphone bluetooth",
//     id: "1986674228",
//   },
//   channel: 1,
//   note: 45,
//   velocity: 0,
// };

// const ccData: MIDIControlMessage = {
//   type: "controlchange",
//   source: {
//     name: "iphone bluetooth",
//     id: "1986674228",
//   },
//   channel: 1,
//   controlNumber: 1,
//   value: 59,
// };

// const foo = new MIDIOberserver("note").onUpdate((data) => {});
// foo.update(noteData);

// const bar = new MIDIOberserver("controlchange").onUpdate((data) => {});
// bar.update(ccData);

// const baz = new MIDIOberserver("portchange").onUpdate((data) => {});

export default MIDIOberserver;
export type { MIDIOberserver, MIDIObserverDataMap, MIDIObserverType };
