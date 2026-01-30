import type { MIDIMessageTypeEntries } from "./midi-message";
import type { MIDIInputStream, MIDIOutputRouter } from "./midi-ports";

type InputChangeHandler = (e: MIDIInput[]) => void;
type OutputChangeHandler = (e: MIDIOutput[]) => void;
type MIDIMessageHandler = (msg: MIDIMessage) => void;

interface MIDIControllerPorts {
  inputs: Map<string, MIDIInputStream>;
  outputs: Map<string, MIDIOutputRouter>;
}

interface MIDIControllerListeners {
  inputs: Set<InputChangeHandler>;
  outputs: Set<OutputChangeHandler>;
}

// MIDI Messages
interface BaseMIDIMessage {
  source: { name: string; id: string };
  channel: number;
}

interface DefaultMIDIMessage extends BaseMIDIMessage {
  type: "aftertouch" | "pitchbend";
  data1: number;
  data2: number;
}

interface MIDINoteMessage extends BaseMIDIMessage {
  type: "noteon" | "noteoff";
  note: number;
  velocity: number;
}

interface MIDIControlMessage extends BaseMIDIMessage {
  type: "controlchange";
  controlNumber: number;
  value: number;
}

interface MIDIProgramMessage extends BaseMIDIMessage {
  type: "programchange";
  program: number;
}

type MIDIMessageType = (typeof MIDIMessageTypeEntries)[number][1];

type MIDIMessage =
  | DefaultMIDIMessage
  | MIDINoteMessage
  | MIDIControlMessage
  | MIDIProgramMessage
  | null;

export type {
  InputChangeHandler,
  OutputChangeHandler,
  MIDIMessageHandler,
  MIDIControllerPorts,
  MIDIControllerListeners,
  MIDIControlMessage,
  MIDIMessageType,
  MIDIMessage,
  MIDINoteMessage,
};
