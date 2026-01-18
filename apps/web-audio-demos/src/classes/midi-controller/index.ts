import { getMIDIPort } from "./utils";
import { MIDIInputStream, MIDIOutputRouter } from "./midi-ports";
import type {
  MIDIControllerListeners,
  MIDIControllerPorts,
  InputChangeHandler,
  OutputChangeHandler,
} from "./types";

class MIDIController {
  private _midi: MIDIAccess;
  private _activePorts: MIDIControllerPorts;
  private _listeners: MIDIControllerListeners;
  private _controller: AbortController;

  private constructor(midi: MIDIAccess) {
    this._midi = midi;
    this._activePorts = { inputs: new Map(), outputs: new Map() };
    this._listeners = { inputs: new Set(), outputs: new Set() };
    this._controller = new AbortController();

    this.midi.addEventListener(
      "statechange",
      (e) => {
        if (!(e.target instanceof MIDIAccess) || !e.port) return;

        const { port } = e;

        if (port instanceof MIDIInput) {
          const inputs = Array.from(this.midi.inputs.values());
          this._listeners.inputs.forEach((fn) => fn(inputs));
        } else if (port instanceof MIDIOutput) {
          const outputs = Array.from(this.midi.outputs.values());
          this._listeners.outputs.forEach((fn) => fn(outputs));
        }
      },
      { signal: this._controller.signal },
    );
  }

  static async init() {
    const midi = await navigator.requestMIDIAccess();
    return new MIDIController(midi);
  }

  subscribe(type: "inputchange", fn: InputChangeHandler): void;
  subscribe(type: "outputchange", fn: OutputChangeHandler): void;
  subscribe(
    type: "inputchange" | "outputchange",
    fn: InputChangeHandler | OutputChangeHandler,
  ) {
    if (type === "inputchange") {
      this._listeners.inputs.add(fn as InputChangeHandler);
      return () => this._listeners.inputs.delete(fn as InputChangeHandler);
    } else {
      this._listeners.outputs.add(fn as OutputChangeHandler);
      return () => this._listeners.outputs.delete(fn as OutputChangeHandler);
    }
  }

  unsubscribe(type: "inputchange", fn: InputChangeHandler): void;
  unsubscribe(type: "outputchange", fn: OutputChangeHandler): void;
  unsubscribe(
    type: "inputchange" | "outputchange",
    fn: InputChangeHandler | OutputChangeHandler,
  ) {
    if (type === "inputchange") {
      this._listeners.inputs.delete(fn as InputChangeHandler);
    } else {
      this._listeners.outputs.delete(fn as OutputChangeHandler);
    }
  }

  input(nameOrId: string) {
    const cached = this._activePorts.inputs.get(nameOrId);
    if (cached) return cached;

    const port = getMIDIPort(this.midi.inputs, nameOrId);

    if (port) {
      const newPort = new MIDIInputStream(port);
      this._activePorts.inputs.set(nameOrId, newPort);
      return newPort;
    }

    return null;
  }

  output(nameOrId: string) {
    const cached = this._activePorts.outputs.get(nameOrId);
    if (cached) return cached;

    const port = getMIDIPort(this.midi.outputs, nameOrId);

    if (port) {
      const newPort = new MIDIOutputRouter(port);
      this._activePorts.outputs.set(nameOrId, newPort);
      return newPort;
    }

    return null;
  }

  destroy() {
    this._controller.abort();
    this._activePorts.inputs.forEach((p) => p.destroy());
    this._activePorts.inputs.clear();
    this._activePorts.outputs.clear();
    this._listeners.inputs.clear();
    this._listeners.outputs.clear();
  }

  get midi() {
    return this._midi;
  }

  get inputs() {
    return Array.from(this._midi.inputs.values());
  }

  get outputs() {
    return Array.from(this._midi.outputs.values());
  }
}

export default MIDIController;
