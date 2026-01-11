import { useEffect, useState } from "react";

export default function MidiController() {
  const [midi, setMidi] = useState<MIDIAccess | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();

    async function init() {
      try {
        const midi = await navigator.requestMIDIAccess();
        setMidi(midi);

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

  return midi ? (
    <div>
      <h2>Midi Inputs</h2>
      <ul>
        {Array.from(midi.inputs).map(([_, input]) => (
          <li key={input.id}>{input.name}</li>
        ))}
      </ul>
      <h2>Midi Outputs</h2>
      <ul>
        {Array.from(midi.outputs).map(([_, output]) => (
          <li key={output.id}>{output.name}</li>
        ))}
      </ul>
    </div>
  ) : (
    <p>Waiting for midi access...</p>
  );
}
