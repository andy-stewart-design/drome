import { useEffect, useState } from "react";

export default function MidiController() {
  const [midi, setMidi] = useState<MIDIAccess | null>(null);
  const [inputs, setInputs] = useState<MIDIInput[]>([]);

  useEffect(() => {
    const ctrl = new AbortController();

    async function init() {
      try {
        const midi = await navigator.requestMIDIAccess();
        setMidi(midi);
        setInputs(Array.from(midi.inputs.values()));

        midi.addEventListener(
          "statechange",
          (e) => {
            if (e.target instanceof MIDIAccess) {
              setInputs(Array.from(e.target.inputs.values()));
            }
          },
          ctrl,
        );

        midi.inputs.forEach((input) => {
          input.addEventListener(
            "midimessage",
            (e) => console.log(e.data),
            ctrl,
          );
        });
      } catch (e: any) {
        console.error(`Failed to get MIDI access - ${e}`);
      }
    }

    init();

    return ctrl.abort;
  }, []);

  return midi && inputs ? (
    <div>
      <h2>Midi Inputs</h2>
      <ul>
        {inputs.map((input) => (
          <li key={input.id}>
            {input.name} ({input.id})
          </li>
        ))}
      </ul>
      <h2>Midi Outputs</h2>
      <div>
        {/*<button
          onClick={() => {
            const out = getMidiInputByName(midi, "OP-1");
            out?.send([0x91, 60, 127]);
            out?.send([0x81, 60, 127], window.performance.now() + 1000.0);
          }}
          // onMouseDown={() => {
          //   const out = getMidiInputByName(midi, "OP-1");
          //   out?.send([0x91, 60, 127], window.performance.now() + 1000.0);
          // }}
          // onMouseUp={() => {
          //   const out = getMidiInputByName(midi, "OP-1");
          //   out?.send([0x81, 60, 127], window.performance.now() + 1000.0);
          // }}
        >
          Send MIDI
        </button>*/}
      </div>
      <ul>
        {Array.from(midi.outputs).map(([_, output]) => (
          <li key={output.id}>
            {output.name} ({output.id})
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
  ) : (
    <p>Waiting for midi access...</p>
  );
}

function getMidiInputByName(midi: MIDIAccess, name: string) {
  for (const [_, output] of midi.outputs) {
    if (output.name === name) {
      console.log(`Found input port: ${output.name}, id: ${output.id}`);
      return output;
    }
  }
  console.warn(`No input port found with name: ${name}`);
  return undefined;
}
