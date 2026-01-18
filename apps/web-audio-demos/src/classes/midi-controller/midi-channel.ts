import type { MIDIInputStream } from "./midi-ports";
import type { MIDIMessage, MIDIMessageType, MIDIMessageHandler } from "./types";

type MIDIChannelMessageType = MIDIMessageType | "note" | "all";

class MIDIChannel {
  private _parent: MIDIInputStream;
  private _index: number;
  private _subscribers: Map<MIDIChannelMessageType, Set<MIDIMessageHandler>>;

  constructor(parent: MIDIInputStream, index: number) {
    this._parent = parent;
    this._index = index;
    this._subscribers = new Map();
  }

  subscribe(t: MIDIChannelMessageType, f: MIDIMessageHandler): () => void;
  subscribe(f: MIDIMessageHandler): () => void;
  subscribe(
    a: MIDIChannelMessageType | MIDIMessageHandler,
    b?: MIDIMessageHandler,
  ) {
    const type = typeof a === "string" ? a : "all";
    const fn = typeof a === "string" ? b : a;

    if (!fn) throw new Error("No subscribe function provided");

    let listeners = this._subscribers.get(type);

    if (!listeners) {
      listeners = new Set();
      this._subscribers.set(type, listeners);
    }

    listeners.add(fn);

    return () => listeners.delete(fn);
  }

  unsubscribe(t: MIDIChannelMessageType, f: MIDIMessageHandler): void;
  unsubscribe(f: MIDIMessageHandler): void;
  unsubscribe(
    a: MIDIChannelMessageType | MIDIMessageHandler,
    b?: MIDIMessageHandler,
  ) {
    const type = typeof a === "string" ? a : "all";
    const fn = typeof a === "string" ? b : a;
    if (fn) this._subscribers.get(type)?.delete(fn);
  }

  emit(msg: MIDIMessage) {
    if (!msg) return;
    if (msg.type === "noteoff" || msg.type === "noteon") {
      const set1 = this._subscribers.get("note");
      const set2 = this._subscribers.get(msg.type);
      set1?.forEach((fn) => fn(msg));
      set2?.forEach((fn) => fn(msg));
    } else {
      this._subscribers.get(msg.type)?.forEach((fn) => fn(msg));
    }
  }

  destroy() {
    this._subscribers.forEach((set) => set.clear());
    this._subscribers.clear();
    this._parent.removeChannel(this._index);
  }
}

export { MIDIChannel };
