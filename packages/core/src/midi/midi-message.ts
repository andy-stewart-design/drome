import type { MIDIMessageType } from "./types";

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

export { MIDIMessageTypeEntries, MIDIMessageTypeMap };
