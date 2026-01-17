import { MIDIMessageTypeMap } from "./midi-message";
import type { MIDIMessage } from "./types";

type Identifier = string | { id: string };

function getMIDIPort(p: MIDIInputMap, i: Identifier): MIDIInput | null;
function getMIDIPort(p: MIDIOutputMap, i: Identifier): MIDIOutput | null;
function getMIDIPort(
  ports: MIDIInputMap | MIDIOutputMap,
  ident: Identifier,
): MIDIInput | MIDIOutput | null {
  if (typeof ident === "string") {
    const name = ident.toLocaleLowerCase();
    for (const [_, port] of ports) {
      if (port.name?.toLocaleLowerCase() === name) return port;
    }
  } else {
    const port = ports.get(ident.id);
    if (port) return port;
  }

  console.warn(`No input port found with: ${JSON.stringify(ident)}`);
  return null;
}

function formatNoteCommand(t: "on" | "off", c: number, n: number, v: number) {
  const type = t === "on" ? 9 : 8;
  const channel = Math.min(Math.max(c - 1, 0), 15);
  const command = (type << 4) | channel;
  const note = Math.min(Math.max(n, 0), 127);
  const velocity = t === "off" ? 0 : Math.min(Math.max(v, 0), 127);
  return [command, note, velocity] as const;
}

function readMIDIMessage(data: Uint8Array, input: MIDIInput): MIDIMessage {
  const status = data[0];
  const rawType = (status & 0xf0) >> 4;
  const channel = (status & 0x0f) + 1;

  const key = rawType.toString(16).toUpperCase();
  let type = MIDIMessageTypeMap.get(key);
  const data1 = data[1];
  const data2 = data[2];
  const { name, id } = input;

  if (!type || !name) return null;
  const source = { name: name.toLocaleLowerCase(), id };

  if (type === "note_on" && data2 === 0) type = "note_off"; // note_on with velocity 0 = note_off

  switch (type) {
    case "note_on":
    case "note_off":
      return { type, source, channel, note: data1, velocity: data2 };
    case "control_change":
      return { type, source, channel, controlNumber: data1, value: data2 };
    case "program_change":
      return { type, source, channel, program: data1 };
    default:
      return { type, source, channel, data1, data2 };
  }
}

export { formatNoteCommand, readMIDIMessage, getMIDIPort };
