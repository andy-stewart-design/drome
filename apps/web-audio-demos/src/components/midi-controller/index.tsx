import { useEffect, useState, useCallback } from "react";

type MIDIInOut = MIDIInput | MIDIOutput;

export default function MidiController() {
  const [midi, setMidi] = useState<MIDIAccess | null>(null);
  const [inputs, setInputs] = useState<MIDIInput[]>([]);
  const [outputs, setOutputs] = useState<MIDIOutput[]>([]);
  const [message, setMessage] =
    useState<ReturnType<typeof readMIDIMessage>>(null);

  useEffect(() => {
    const ctrl = new AbortController();

    async function init() {
      try {
        const midiAccess = await navigator.requestMIDIAccess();
        setMidi(midiAccess);
        setInputs(Array.from(midiAccess.inputs.values()));
        setOutputs(Array.from(midiAccess.outputs.values()));

        midiAccess.addEventListener(
          "statechange",
          (e) => {
            if (!(e.target instanceof MIDIAccess) || !e.port) return;
            const { port } = e;

            if (port.state === "disconnected") {
              if (port instanceof MIDIInput)
                setInputs((p) => removeMIDIPort(p, port));
              else if (port instanceof MIDIOutput)
                setOutputs((p) => removeMIDIPort(p, port));
            } else if (port.state === "connected") {
              if (port instanceof MIDIInput)
                setInputs((p) => addMIDIPort(p, port));
              else if (port instanceof MIDIOutput)
                setOutputs((p) => addMIDIPort(p, port));
            }
          },
          { signal: ctrl.signal },
        );
      } catch (e) {
        console.error("Failed to get MIDI access", e);
      }
    }

    init();
    return () => ctrl.abort();
  }, []);

  const handleMIDIMessage = useCallback((e: MIDIMessageEvent) => {
    if (e.data && e.target instanceof MIDIInput) {
      setMessage(readMIDIMessage(e.data, e.target));
    }
  }, []);

  return (
    <div>
      <h2>Midi Inputs</h2>
      <ul>
        {inputs.map((entry) => (
          <li key={entry.id}>
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  entry.addEventListener("midimessage", handleMIDIMessage);
                } else {
                  entry.removeEventListener("midimessage", handleMIDIMessage);
                }
              }}
            />
            {entry.name} ({entry.id})
          </li>
        ))}
      </ul>
      <h2>Midi Outputs</h2>
      <ul>
        {outputs.map((entry) => (
          <li key={entry.id}>
            {entry.name} ({entry.id})
            <button
              onMouseDown={() => {
                const out = getMidiInputByName(midi, "op-1");
                out?.send(formatNoteCommand("on", 2, 60, 127));
              }}
              onMouseUp={() => {
                const out = getMidiInputByName(midi, "op-1");
                out?.send(formatNoteCommand("off", 2, 60, 127));
              }}
            >
              Send MIDI
            </button>
          </li>
        ))}
      </ul>
      {message && <pre>{JSON.stringify(message, null, 2)}</pre>}
    </div>
  );
}

function getMidiInputByName(midi: MIDIAccess | null, name: string) {
  if (!midi) return;
  const n = name.toLocaleLowerCase();
  for (const [_, output] of midi.outputs) {
    if (output.name?.toLocaleLowerCase() === n) return output;
  }
  console.warn(`No input port found with name: ${name}`);
}

function removeMIDIPort<T extends MIDIInOut>(ports: T[], port: T) {
  return ports.filter((item) => item.id !== port.id);
}

function addMIDIPort<T extends MIDIInput | MIDIOutput>(ports: T[], port: T) {
  const exists = ports.some((item) => item.id === port.id);
  return exists ? ports : [...ports, port as T];
}

interface BaseMIDIMessage {
  source: { name: string; id: string };
  channel: number;
}

interface DefaultMIDIMessage extends BaseMIDIMessage {
  type:
    | "polyphonic_aftertouch"
    | "program_change"
    | "channel_aftertouch"
    | "pitch_bend";
  data1: number;
  data2: number;
}

interface MIDINoteMessage extends BaseMIDIMessage {
  type: "note_on" | "note_off";
  note: number;
  velocity: number;
}

interface MIDICCMessage extends BaseMIDIMessage {
  type: "control_change";
  controller: number;
  value: number;
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
type MIDIMessage = DefaultMIDIMessage | MIDINoteMessage | MIDICCMessage | null;

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

  if (type === "note_on" && data2 === 0) {
    type = "note_off"; // note_on with velocity 0 = note_off
  }

  if (type === "note_on" || type === "note_off") {
    return { type, source, channel, note: data1, velocity: data2 };
  } else if (type === "control_change") {
    return { type, source, channel, controller: data1, value: data2 };
  }

  return { type, source, channel, data1, data2 };
}

function formatNoteCommand(t: "on" | "off", c: number, n: number, v: number) {
  const type = t === "on" ? 9 : 8;
  const channel = Math.min(Math.max(c - 1, 0), 15);
  const command = (type << 4) | channel;
  const note = Math.min(Math.max(n, 21), 127);
  const velocity = t === "off" ? 0 : Math.min(Math.max(v, 0), 127);
  return [command, note, velocity] as const;
}
