import type { MIDIMessageTypeEntries } from "./midi-message";
import type { CustomInput, CustomOutput } from "./midi-ports";

type InputChangeHandler = (e: MIDIInput[]) => void;

type OutputChangeHandler = (e: MIDIOutput[]) => void;

type MIDIMessageHandler = (msg: MIDIMessage) => void;

interface MIDIControllerPorts {
  inputs: Map<string, CustomInput>;
  outputs: Map<string, CustomOutput>;
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
  type: "polyphonic_aftertouch" | "channel_aftertouch" | "pitch_bend";
  data1: number;
  data2: number;
}

interface MIDINoteMessage extends BaseMIDIMessage {
  type: "note_on" | "note_off";
  note: number;
  velocity: number;
}

interface MIDIControlMessage extends BaseMIDIMessage {
  type: "control_change";
  controlNumber: number;
  value: number;
}

interface MIDIProgramMessage extends BaseMIDIMessage {
  type: "program_change";
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
  MIDIMessageType,
  MIDIMessage,
};
