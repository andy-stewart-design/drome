import { encodeNoteCommand } from "./utils";

class MIDIRouter {
  private _port: MIDIOutput;
  private _identifier: string; // port name or id
  private _channels: number[] = [1];

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

  noteOn(note: number, vel = 127) {
    this._channels.forEach((c) => {
      this._port.send(encodeNoteCommand("on", c, note, vel));
    });
  }

  noteOff(note: number, vel = 127) {
    this._channels.forEach((c) => {
      this._port.send(encodeNoteCommand("off", c, note, vel));
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
