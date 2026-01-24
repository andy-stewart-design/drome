import { encodeNoteCommand } from "./utils";

class MIDIRouter {
  private _port: MIDIOutput;
  private _identifier: string; // port name or id
  private _channels: number[] = [1];
  private _velocity = 100;

  constructor(port: MIDIOutput, ident?: string) {
    this._port = port;
    this._identifier = ident ?? port.id;
  }

  channel(chan: number | number[]) {
    this._channels.length = 0;

    if (Array.isArray(chan)) this._channels.push(...chan);
    else this._channels.push(chan);
    return this;
  }

  velocity(v: number) {
    this._velocity = v;
    return this;
  }

  noteOn(note: number, when?: number, vel?: number) {
    this._channels.forEach((c) => {
      const midiData = encodeNoteCommand("on", c, note, vel ?? this._velocity);
      this._port.send(midiData, when);
    });
  }

  noteOff(note: number, when?: number) {
    this._channels.forEach((c) => {
      this._port.send(encodeNoteCommand("off", c, note, 0), when);
    });
  }

  destroy() {
    this._identifier = "";
    this._channels.length = 0;
  }

  get identifier() {
    return this._identifier;
  }
}

export default MIDIRouter;
