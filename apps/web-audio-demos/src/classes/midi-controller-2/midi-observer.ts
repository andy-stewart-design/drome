import type { MIDIControlMessage, MIDINoteMessage } from "./types";

interface MIDIObserverDataMap {
  note: MIDINoteMessage;
  controlchange: MIDIControlMessage;
}

interface MIDIObserverUpdateMap {
  note: (data: MIDINoteMessage) => void;
  controlchange: (data: MIDIControlMessage) => void;
}

class MIDIOberserver<T extends "note" | "controlchange"> {
  private _type: T;
  private _update: MIDIObserverUpdateMap[T] | undefined;

  constructor(type: T) {
    this._type = type;
  }

  onUpdate(fn: MIDIObserverUpdateMap[T]) {
    this._update = fn;
    return this;
  }

  update(data: MIDIObserverDataMap[T]) {
    this._update?.(data);
  }
}

const foo = new MIDIOberserver("note").onUpdate((data: MIDINoteMessage) => {});
foo.update();
