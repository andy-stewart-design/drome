import type { MIDIOberserver, MIDIObserverType } from "./midi-observer";
import { readMIDIMessage } from "./utils";

class MIDIObservable<T extends MIDIObserverType> {
  private _input: MIDIInput;
  private _subscribers: Set<MIDIOberserver<T>>;

  constructor(input: MIDIInput) {
    this._input = input;
    this._subscribers = new Set();
    this._input.addEventListener("midimessage", this.emit.bind(this));
  }

  subscribe(subscriber: MIDIOberserver<T>) {
    this._subscribers.add(subscriber);
    return this;
  }

  unsubscribe(subscriber: MIDIOberserver<T>) {
    if (this._subscribers.has(subscriber)) {
      this._subscribers.delete(subscriber);
    }
    return this;
  }

  unsubscribeAll() {
    this._subscribers.clear();
    return this;
  }

  private emit(e: MIDIMessageEvent) {
    if (!e.data) return;
    const parsed = readMIDIMessage(e.data, this._input);
    if (!parsed) return;

    const isNoteMessage = parsed.type === "noteon" || parsed.type === "noteoff";

    this._subscribers.forEach((obs) => {
      if (isNoteMessage && obs.isType("note")) {
        obs.update(parsed);
      } else if (parsed.type === "controlchange" && obs.isType(parsed.type)) {
        obs.update(parsed);
      }
    });
  }
}

export default MIDIObservable;
