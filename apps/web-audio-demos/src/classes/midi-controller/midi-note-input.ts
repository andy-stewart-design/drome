import { readMIDIMessage } from "./utils";
import { EventStream } from "./observable";
import type { MIDINoteMessage } from "./types";

class MIDIControlChangeInput {
  private _port: MIDIInput;
  private _channels: Map<number, MIDIControlChangeStream>;

  constructor(port: MIDIInput) {
    this._port = port;
    this._channels = new Map();
    this._port.addEventListener("midimessage", this.handleMessage.bind(this));
  }

  private handleMessage(e: MIDIMessageEvent) {
    if (!e.data || !(e.target instanceof MIDIInput)) return;
    const msg = readMIDIMessage(e.data, e.target);

    if (msg && (msg.type === "noteon" || msg.type === "noteoff")) {
      const channel = this._channels.get(msg.channel);
      channel?.emit(msg);
    }
  }

  channel(index: number) {
    const channel = this._channels.get(index);
    if (channel) return channel;

    const newChannel = new MIDIControlChangeStream(this, index);
    this._channels.set(index, newChannel);
    return newChannel;
  }

  removeChannel(i: number) {
    this._channels.delete(i);
  }

  destroy() {
    this._channels.forEach((c) => c.destroy());
    this._channels.clear();
    this._port.removeEventListener(
      "midimessage",
      this.handleMessage.bind(this),
    );
  }
}

class MIDIControlChangeStream extends EventStream<MIDINoteMessage> {
  private _parent: MIDIControlChangeInput;
  private _index: number;

  constructor(parent: MIDIControlChangeInput, index: number) {
    super();
    this._parent = parent;
    this._index = index;
  }

  destroy() {
    this.clear();
    this._parent.removeChannel(this._index);
  }
}
