import type { MIDIMessageTypeEntries } from "./midi-message";

// ——————————————————————————————————————————————————————
// MIDI MESSAGE EVENT
// ——————————————————————————————————————————————————————
interface BaseMIDIMessage {
  channel: number;
  input: MIDIInput;
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

// ——————————————————————————————————————————————————————
// MIDI PORT (STATE) CHANGE EVENT
// ——————————————————————————————————————————————————————
type MIDIPortChangeMessage =
  | {
      type: "portchange";
      portType: "input";
      ports: Array<MIDIInput>;
    }
  | {
      type: "portchange";
      portType: "output";
      ports: Array<MIDIOutput>;
    };

type MIDIConnectionAction = "connected" | "disconnected" | "opened" | "closed";

interface BaseMIDIStateChange {
  action: MIDIConnectionAction;
  connected: boolean; // (port.state === "connected")
  open: boolean; // (port.connection === "open")
  active: boolean; // (connected && open)
  ports: { inputs: MIDIInput[]; outputs: MIDIOutput[] };
}

interface MIDIInputStateChange extends BaseMIDIStateChange {
  type: "input";
  port: MIDIInput;
}

interface MIDIOutputStateChange extends BaseMIDIStateChange {
  type: "output";
  port: MIDIOutput;
}

type MIDIPortChange = MIDIInputStateChange | MIDIOutputStateChange;

export type {
  MIDIControlMessage,
  MIDIMessageType,
  MIDIMessage,
  MIDINoteMessage,
  MIDIPortChange,
  MIDIPortChangeMessage,
};
