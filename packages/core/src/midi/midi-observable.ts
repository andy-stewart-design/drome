import { parseMIDIPortChange, parseMIDIMessage } from "./utils";
import type { MIDIOberserver, MIDIObserverType } from "./midi-observer";

type MIDIObservableType = "portchange" | "midimessage";

class MIDIPortChangeObservable<T extends MIDIObserverType> {
  private _input: MIDIInput | undefined;
  private _controller: AbortController;
  private _subscribers: Set<MIDIOberserver<T>>;
  readonly type: MIDIObservableType;

  constructor(target: MIDIAccess | MIDIInput) {
    this._subscribers = new Set();
    this._controller = new AbortController();
    const { signal } = this._controller;

    if (target instanceof MIDIAccess) {
      target.addEventListener("statechange", this.emitPortChange.bind(this), {
        signal,
      });
      this.type = "portchange";
    } else {
      this._input = target;
      target.addEventListener("midimessage", this.emitMIDIMessage.bind(this), {
        signal,
      });
      this.type = "midimessage";
    }
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
    this.subscribers.forEach((obs) => obs.destroy());
    this._subscribers.clear();
    return this;
  }

  private emitPortChange(e: MIDIConnectionEvent) {
    const midi = e.target;
    const portType = e.port?.type;
    if (!portType || !(midi instanceof MIDIAccess)) return;

    this._subscribers.forEach((obs) => {
      if (!obs.isType("portchange")) return;
      const data = parseMIDIPortChange(e);
      if (data) obs.update(data);
    });
  }

  private emitMIDIMessage(e: MIDIMessageEvent) {
    if (!e.data || !(e.target instanceof MIDIInput)) return;
    const parsed = parseMIDIMessage(e.data, e.target);
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

  destroy() {
    this.unsubscribeAll();
    this._controller.abort();
  }

  get input() {
    return this._input;
  }

  get subscribers() {
    return this._subscribers;
  }
}

export default MIDIPortChangeObservable;
export { type MIDIObservableType };
