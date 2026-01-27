import { encodeNoteCommand } from "./utils";

class MIDIRouter {
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
      this._port.send(encodeNoteCommand("on", c, note, vel));
    });
  }

  noteOff(note: number, vel = 127) {
    this._channels.forEach((c) => {
      this._port.send(encodeNoteCommand("off", c, note, vel));
    });
  }
}

export default MIDIRouter;
