import type { MIDIOberserver, MIDIObserverType } from "./midi-observer";
import { readMIDIMessage } from "./utils";

class MIDIPortChangeObservable<T extends MIDIObserverType> {
  private _controller: AbortController;
  private _subscribers: Set<MIDIOberserver<T>>;

  constructor(target: MIDIAccess | MIDIInput) {
    this._subscribers = new Set();
    this._controller = new AbortController();
    const { signal } = this._controller;

    if (target instanceof MIDIAccess) {
      target.addEventListener("statechange", this.emitPortChange.bind(this), {
        signal,
      });
    } else {
      target.addEventListener("midimessage", this.emitMIDIMessage.bind(this), {
        signal,
      });
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
    this._subscribers.clear();
    return this;
  }

  private emitPortChange(e: MIDIConnectionEvent) {
    const midi = e.target;
    const portType = e.port?.type;
    if (!portType || !(midi instanceof MIDIAccess)) return;

    this._subscribers.forEach((obs) => {
      if (!obs.isType("portchange")) return;

      if (portType === "input") {
        const ports = Array.from(midi.inputs.values());
        obs.update({ type: "portchange", portType, ports });
      } else {
        const ports = Array.from(midi.outputs.values());
        obs.update({ type: "portchange", portType, ports });
      }
    });
  }

  private emitMIDIMessage(e: MIDIMessageEvent) {
    if (!e.data || !(e.target instanceof MIDIInput)) return;
    const parsed = readMIDIMessage(e.data, e.target);
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
}

export default MIDIPortChangeObservable;
