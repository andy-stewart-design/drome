import { formatNoteCommand, readMIDIMessage } from "./utils";
import type { MIDIMessage, MIDIMessageHandler } from "./types";

class CustomInput {
  private _port: MIDIInput;
  readonly _channels: Map<number, MIDIChannel>;

  constructor(port: MIDIInput) {
    this._port = port;
    this._channels = new Map();

    this._port.addEventListener("midimessage", (e: MIDIMessageEvent) => {
      if (!e.data || !(e.target instanceof MIDIInput)) return;
      const message = readMIDIMessage(e.data, e.target);

      if (message) {
        const channel = this._channels.get(message.channel);
        channel?.dispatch(message);
      }
    });
  }

  channel(index: number) {
    const channel = this._channels.get(index);
    if (channel) return channel;

    const newChannel = new MIDIChannel(this, index);
    this._channels.set(index, newChannel);
    return newChannel;
  }

  destroy() {
    this._channels.forEach((c) => c.destroy());
    this._channels.clear();
  }
}

class MIDIChannel {
  private _parent: CustomInput;
  private _index: number;
  private _listeners: Set<MIDIMessageHandler>;

  constructor(parent: CustomInput, index: number) {
    this._parent = parent;
    this._index = index;
    this._listeners = new Set();
  }

  addListener(fn: MIDIMessageHandler) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  removeListener(fn: MIDIMessageHandler) {
    this._listeners.delete(fn);
  }

  destroy() {
    this._listeners.clear();
    this._parent._channels.delete(this._index);
  }

  dispatch(msg: MIDIMessage) {
    this._listeners.forEach((fn) => fn(msg));
  }
}

class CustomOutput {
  private _port: MIDIOutput;
  private _channels: number[] = [1];

  constructor(port: MIDIOutput) {
    this._port = port;
  }

  channel(chan: number | number[]) {
    this._channels.length = 0;

    if (Array.isArray(chan)) this._channels.push(...chan);
    else this._channels.push(chan);
    return this;
  }

  noteOn(note: number, vel = 127) {
    this._channels.forEach((c) => {
      this._port.send(formatNoteCommand("on", c, note, vel));
    });
  }

  noteOff(note: number, vel = 127) {
    this._channels.forEach((c) => {
      this._port.send(formatNoteCommand("off", c, note, vel));
    });
  }
}

export { CustomInput, CustomOutput };
