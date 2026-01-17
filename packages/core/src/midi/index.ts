import { getMIDIPort } from "./utils";
import { CustomInput, CustomOutput } from "./midi-ports";
import type {
  MIDIControllerListeners,
  MIDIControllerPorts,
  InputChangeHandler,
  OutputChangeHandler,
} from "./types";

class MIDIController {
  private _midi: MIDIAccess;
  private _ports: MIDIControllerPorts;
  private _listeners: MIDIControllerListeners;
  private _controller: AbortController;

  private constructor(midi: MIDIAccess) {
    this._midi = midi;
    this._ports = { inputs: new Map(), outputs: new Map() };
    this._controller = new AbortController();
    this._listeners = { inputs: new Set(), outputs: new Set() };

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
    const midi = await navigator.requestMIDIAccess({ sysex: false });
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

  removeListener(type: "input-change", fn: InputChangeHandler): void;
  removeListener(type: "output-change", fn: OutputChangeHandler): void;
  removeListener(
    type: "input-change" | "output-change",
    fn: InputChangeHandler | OutputChangeHandler,
  ) {
    if (type === "input-change") {
      this._listeners.inputs.delete(fn as InputChangeHandler);
    } else {
      this._listeners.outputs.delete(fn as OutputChangeHandler);
    }
  }

  input(ident: string | { id: string }) {
    const name = typeof ident === "string" ? ident : ident.id;
    const cached = this._ports.inputs.get(name);
    if (cached) return cached;

    const port = getMIDIPort(this.midi.inputs, ident);
    if (port) {
      const newPort = new CustomInput(port);
      this._ports.inputs.set(name, newPort);
      return newPort;
    }
    return null;
  }

  output(ident: string | { id: string }) {
    const name = typeof ident === "string" ? ident : ident.id;
    const cached = this._ports.outputs.get(name);
    if (cached) return cached;

    const port = getMIDIPort(this.midi.outputs, ident);
    if (port) {
      const newPort = new CustomOutput(port);
      this._ports.outputs.set(name, newPort);
      return newPort;
    }
    return null;
  }

  destroy() {
    this._controller.abort();
    this._ports.inputs.forEach((p) => p.destroy());
    this._ports.inputs.clear();
    this._ports.outputs.clear();
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
