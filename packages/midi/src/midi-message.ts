import type { MIDIMessageType } from "./types";

const MIDIMessageTypeEntries = [
  ["8", "noteoff"],
  ["9", "noteon"],
  ["A", "aftertouch"],
  ["B", "controlchange"],
  ["C", "programchange"],
  ["D", "aftertouch"],
  ["E", "pitchbend"],
] as const;

const MIDIMessageTypeMap = new Map<string, MIDIMessageType>(
  MIDIMessageTypeEntries,
);

export { MIDIMessageTypeEntries, MIDIMessageTypeMap };
