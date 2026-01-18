import type { MIDIControlMessage, MIDINoteMessage } from "./types";

interface MIDIObserverDataMap {
  note: MIDINoteMessage;
  controlchange: MIDIControlMessage;
}

type MIDIObserverType = keyof MIDIObserverDataMap;

class MIDIOberserver<T extends MIDIObserverType> {
  private _type: T;
  private _identifier: string; // port name or id
  private _channels: number[] = [1];
  private _update: ((data: MIDIObserverDataMap[T]) => void) | undefined;
  private _defaultValue: number | undefined;

  constructor(type: T, ident: string, defaultValue?: number) {
    this._type = type;
    this._identifier = ident;
    this._defaultValue = defaultValue;
  }

  channel(n: number | number[]) {
    this._channels.length = 0;
    this._channels.push(...[n].flat());
    return this;
  }

  onUpdate(fn: (data: MIDIObserverDataMap[T]) => void) {
    this._update = fn;
    return this;
  }

  update(data: MIDIObserverDataMap[T]) {
    if (!this._update) {
      console.warn("[MIDIObserver]: update function is undefined");
    }
    this._update?.(data);
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

export default MIDIOberserver;
export type { MIDIObserverType, MIDIOberserver };
