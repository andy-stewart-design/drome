import { map } from "@/utils/math";
import type {
  MIDIControlMessage,
  MIDINoteMessage,
  MIDIPortChange,
} from "./types";
import { isNumber } from "@/utils/validators";

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
  private _type: T;
  private _identifier: string; // port name or id
  private _channels: number[] = [1];
  private _update: Set<UpdateCallback<T>>;
  private _defaultValue: number;
  private _min: number | undefined;
  private _max: number | undefined;

  chan: (n: number | number[]) => this;

  constructor(type: T, ident?: string, defaultValue = 0) {
    if ((type === "note" || type === "controlchange") && !ident) {
      console.log(type);
      console.error("[MIDI Observer]: must provide a port id or name.");
    }

    this._type = type;
    this._identifier = ident ?? crypto.randomUUID();
    this._defaultValue = defaultValue;
    this._update = new Set();
    this.chan = this.channel.bind(this);
  }

  channel(n: number | number[]) {
    this._channels.length = 0;
    this._channels.push(...[n].flat());
    return this;
  }

  onUpdate(fn: (data: MIDIObserverDataMap[T]) => void) {
    this._update.add(fn);
    return this;
  }

  update(data: MIDIObserverDataMap[T]) {
    if (!this._update.size) {
      console.warn("[MIDIObserver]: update function is undefined");
    }

    if (
      data.type === "controlchange" &&
      isNumber(this._min) &&
      isNumber(this._max)
    ) {
      const mappedData = {
        ...data,
        value: map(data.value, 0, 127, this._min, this._max),
      };
      this._update.forEach((fn) => fn(mappedData));
    } else {
      this._update.forEach((fn) => fn(data));
    }
  }

  clear() {
    this._update.clear();
  }

  range(min: number, max: number) {
    this._min = min;
    this._max = max;
    return this;
  }

  isType<K extends MIDIObserverType>(type: K): this is MIDIOberserver<K> {
    return this._type === (type as any);
  }

  get channels() {
    return this._channels;
  }

  get defaultValue() {
    if (this.type === "controlchange") {
      return this._defaultValue || 0;
    }
    return this._defaultValue;
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
export type { MIDIOberserver, MIDIObserverType };
