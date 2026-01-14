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

const MIDIMessageTypeEntries = [
  ["8", "note_off"],
  ["9", "note_on"],
  ["A", "polyphonic_aftertouch"],
  ["B", "control_change"],
  ["C", "program_change"],
  ["D", "channel_aftertouch"],
  ["E", "pitch_bend"],
] as const;

const MIDIMessageTypeMap = new Map<string, MIDIMessageType>(
  MIDIMessageTypeEntries,
);

type MIDIMessageType = (typeof MIDIMessageTypeEntries)[number][1];
type MIDIMessage =
  | DefaultMIDIMessage
  | MIDINoteMessage
  | MIDIControlMessage
  | MIDIProgramMessage
  | null;

export { MIDIMessageTypeMap, type MIDIMessage };
