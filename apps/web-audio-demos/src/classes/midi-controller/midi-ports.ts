import { MIDIChannel } from "./midi-channel";
import { formatNoteCommand, readMIDIMessage } from "./utils";

class MIDIInputStream {
  private _port: MIDIInput;
  readonly _channels: Map<number, MIDIChannel>;

  constructor(port: MIDIInput) {
    this._port = port;
    this._channels = new Map();
    this._port.addEventListener("midimessage", this.handleMessage.bind(this));
  }

  private handleMessage(e: MIDIMessageEvent) {
    if (!e.data || !(e.target instanceof MIDIInput)) return;
    const message = readMIDIMessage(e.data, e.target);

    if (message) {
      const channel = this._channels.get(message.channel);
      channel?.emit(message);
    }
  }

  channel(index: number) {
    const channel = this._channels.get(index);
    if (channel) return channel;

    const newChannel = new MIDIChannel(this, index);
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

class MIDIOutputRouter {
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

export { MIDIInputStream, MIDIOutputRouter };
