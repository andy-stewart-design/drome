import { MIDIInputChangeEvent, MIDIOutputChangeEvent } from "./events";
import { formatNoteCommand, readMIDIMessage, getMIDIPort } from "./utils";
import { type MIDIMessage } from "./midi-message";

type PortData = Partial<{ name: string | null; id: string | null }>;
type InputChangeHandler = (e: MIDIInputChangeEvent) => void;
type OutputChangeHandler = (e: MIDIOutputChangeEvent) => void;
interface MIDIControllerListeners {
  inputs: Set<InputChangeHandler>;
  outputs: Set<OutputChangeHandler>;
}

class MIDIController {
  private _midi: MIDIAccess;
  private _ports: { in: Map<string, MIDIIn>; out: Map<string, MIDIOut> };
  private _listeners: MIDIControllerListeners;
  private _controller: AbortController;

  private constructor(midi: MIDIAccess) {
    this._midi = midi;
    this._ports = { in: new Map(), out: new Map() };
    this._controller = new AbortController();
    this._listeners = { inputs: new Set(), outputs: new Set() };

    this.midi.addEventListener(
      "statechange",
      (e) => {
        if (!(e.target instanceof MIDIAccess) || !e.port) return;

        const { port } = e;

        if (port instanceof MIDIInput) {
          const event = new MIDIInputChangeEvent(this.midi.inputs);
          this._listeners.inputs.forEach((fn) => fn(event));
        } else if (port instanceof MIDIOutput) {
          const event = new MIDIOutputChangeEvent(this.midi.outputs);
          this._listeners.outputs.forEach((fn) => fn(event));
        }
      },
      { signal: this._controller.signal },
    );
  }

  static async create() {
    const midi = await navigator.requestMIDIAccess();
    return new MIDIController(midi);
  }

  addListener(type: "input-change", fn: InputChangeHandler): void;
  addListener(type: "output-change", fn: OutputChangeHandler): void;
  addListener(
    type: "input-change" | "output-change",
    fn: InputChangeHandler | OutputChangeHandler,
  ) {
    if (type === "input-change") {
      this._listeners.inputs.add(fn as InputChangeHandler);
      return () => this._listeners.inputs.delete(fn as InputChangeHandler);
    } else {
      this._listeners.outputs.add(fn as OutputChangeHandler);
      return () => this._listeners.outputs.delete(fn as OutputChangeHandler);
    }
  }

  input(data: PortData) {
    const name = data.name!;
    const cached = this._ports.in.get(name);
    if (cached) return cached;

    const port = getMIDIPort(this.midi.inputs, data);
    if (port) {
      const newPort = new MIDIIn(port);
      this._ports.in.set(name, newPort);
      return newPort;
    }
    return null;
  }

  output(data: PortData) {
    const port = getMIDIPort(this.midi.outputs, data);
    if (port) return new MIDIOut(port);
    return null;
  }

  destroy() {
    this._controller.abort();
    this._listeners.inputs.clear();
    this._listeners.outputs.clear();
  }

  get midi() {
    if (!this._midi) {
      throw new Error("MIDI Access not available");
    }
    return this._midi;
  }
}

export default MIDIController;

type MIDIMessageCallback = (msg: MIDIMessage) => void;

class MIDIIn {
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
}

class MIDIChannel {
  private _parent: MIDIIn;
  private _index: number;
  private _listeners: Set<MIDIMessageCallback>;

  constructor(parent: MIDIIn, index: number) {
    this._parent = parent;
    this._index = index;
    this._listeners = new Set();
  }

  addListener(fn: MIDIMessageCallback) {
    this._listeners.add(fn);
    return () => this._listeners.delete(fn);
  }

  removeListener(fn: MIDIMessageCallback) {
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

class MIDIOut {
  private _port: MIDIOutput;

  constructor(port: MIDIOutput) {
    this._port = port;
  }

  noteOn(note: number, chan: number | number[] = 1, vel = 127) {
    if (Array.isArray(chan)) {
      chan.forEach((c) => {
        this._port.send(formatNoteCommand("on", c, note, vel));
      });
    } else {
      this._port.send(formatNoteCommand("on", chan, note, vel));
    }
  }

  noteOff(note: number, chan: number | number[] = 1, vel = 127) {
    if (Array.isArray(chan)) {
      chan.forEach((c) => {
        this._port.send(formatNoteCommand("off", c, note, vel));
      });
    } else {
      this._port.send(formatNoteCommand("off", chan, note, vel));
    }
  }
}
