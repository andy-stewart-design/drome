import { MIDIMessageTypeMap } from "./midi-message";
import type { MIDIMessage, MIDIPortChange } from "./types";

// ----------------------------------------------------------------
// MIDI PORT ACCESSOR
// ----------------------------------------------------------------
function getMIDIPort(p: MIDIInputMap, i: string): MIDIInput | null;
function getMIDIPort(p: MIDIOutputMap, i: string): MIDIOutput | null;
function getMIDIPort(
  ports: MIDIInputMap | MIDIOutputMap,
  nameOrId: string,
): MIDIInput | MIDIOutput | null {
  const port = ports.get(nameOrId) ?? getPortByName(ports, nameOrId);
  if (port) return port;
  console.warn(`No MIDI port found matching: ${nameOrId}`);
  return null;
}

function getPortByName(ports: MIDIInputMap | MIDIOutputMap, name: string) {
  const n = name.toLocaleLowerCase();
  for (const [_, port] of ports) {
    if (port.name?.toLocaleLowerCase() === n) {
      return port;
    }
  }
  return null;
}

// ----------------------------------------------------------------
// ENCODE MIDI OUTPUT DATA
// ----------------------------------------------------------------
function encodeNoteCommand(t: "on" | "off", c: number, n: number, v: number) {
  const type = t === "on" ? 9 : 8;
  const channel = Math.min(Math.max(c - 1, 0), 15);
  const command = (type << 4) | channel;
  const note = Math.min(Math.max(n, 0), 127);
  const velocity = t === "off" ? 0 : Math.min(Math.max(v, 0), 127);
  return [command, note, velocity] as const;
}

// ----------------------------------------------------------------
// PARSE MIDI INPUT DATA
// ----------------------------------------------------------------
function parseMIDIMessage(data: Uint8Array, input: MIDIInput): MIDIMessage {
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

  if (type === "noteon" && data2 === 0) type = "noteoff"; // note_on with velocity 0 = note_off

  switch (type) {
    case "noteon":
    case "noteoff":
      return { type, source, channel, note: data1, velocity: data2 };
    case "controlchange":
      return { type, source, channel, controlNumber: data1, value: data2 };
    case "programchange":
      return { type, source, channel, program: data1 };
    default:
      return { type, source, channel, data1, data2 };
  }
}

// ----------------------------------------------------------------
// PARSE MIDI CONNECTION EVENT
// ----------------------------------------------------------------
function parseMIDIPortChange(e: MIDIConnectionEvent): MIDIPortChange | null {
  const midi = e.target;
  const p = e.port;
  if (!p || !(midi instanceof MIDIAccess)) return null;

  const base = {
    action: parsePortChangeType(p),
    connected: p.state === "connected",
    open: p.connection === "open",
    active: p.state === "connected" && p.connection === "open",
    ports: {
      inputs: Array.from(midi.inputs.values()),
      outputs: Array.from(midi.outputs.values()),
    },
  } as const;

  if (p instanceof MIDIInput) {
    return { ...base, type: "input", port: p };
  } else if (p instanceof MIDIOutput) {
    return { ...base, type: "output", port: p };
  } else return null;
}

function parsePortChangeType(p: MIDIPort) {
  if (p.state === "disconnected") {
    return "disconnected"; // If it's disconnected, the hardware was removed.
  } else if (p.state === "connected" && p.connection === "open") {
    return "opened"; // If it's connected and open, it just finished the opening handshake.
  } else if (p.state === "connected" && p.connection === "closed") {
    // If it's connected but closed, it was either just plugged in
    // OR it was just manually closed via port.close().
    // Usually, we treat this as a hardware connection discovery.
    return "connected";
  } else {
    return "closed"; // Fallback for 'pending' or other transitions
  }
}

export {
  encodeNoteCommand,
  parseMIDIMessage,
  getMIDIPort,
  parseMIDIPortChange,
};
