import { useEffect, useState } from "react";

type MIDIInOut = MIDIInput | MIDIOutput;

export default function MidiController() {
  const [midi, setMidi] = useState<MIDIAccess | null>(null);
  const [inputs, setInputs] = useState<MIDIInput[]>([]);
  const [outputs, setOutputs] = useState<MIDIOutput[]>([]);

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

        midiAccess.inputs.forEach((input) => {
          input.addEventListener("midimessage", (e) => console.log(e.data), {
            signal: ctrl.signal,
          });
        });
      } catch (e) {
        console.error("Failed to get MIDI access", e);
      }
    }

    init();
    return () => ctrl.abort();
  }, []);

  return (
    <div>
      <h2>Midi Inputs</h2>
      <ul>
        {inputs.map((entry) => (
          <li key={entry.id}>
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
              // onClick={() => {
              //   const out = getMidiInputByName(midi, "OP-1");
              //   out?.send([0x91, 60, 127]);
              //   out?.send([0x81, 60, 127], window.performance.now() + 1000.0);
              // }}
              onMouseDown={() => {
                const out = getMidiInputByName(midi, "OP-1");
                out?.send([0x91, 60, 127]);
              }}
              onMouseUp={() => {
                const out = getMidiInputByName(midi, "OP-1");
                out?.send([0x81, 60, 127]);
              }}
            >
              Send MIDI
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function getMidiInputByName(midi: MIDIAccess | null, name: string) {
  if (!midi) return;
  for (const [_, output] of midi.outputs) {
    if (output.name === name) {
      console.log(`Found input port: ${output.name}, id: ${output.id}`);
      return output;
    }
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
