import { useEffect, useState, useCallback } from "react";
import MIDIController from "@/classes/midi-controller";
import {
  MIDIInputChangeEvent,
  MIDIOutputChangeEvent,
} from "@/classes/midi-controller/events";
import type { MIDIMessage } from "@/classes/midi-controller/midi-message";

export default function MidiController() {
  const [controller, setController] = useState<MIDIController | null>(null);
  const [inputs, setInputs] = useState<MIDIInput[]>([]);
  const [outputs, setOutputs] = useState<MIDIOutput[]>([]);
  const [message, setMessage] = useState<MIDIMessage | null>(null);

  useEffect(() => {
    let controller: MIDIController | undefined;

    async function init() {
      try {
        controller = await MIDIController.create();

        setController(controller);
        setInputs(Array.from(controller.midi.inputs.values()));
        setOutputs(Array.from(controller.midi.outputs.values()));

        controller.addListener("input-change", (e: MIDIInputChangeEvent) =>
          setInputs(e.inputs),
        );

        controller.addListener("output-change", (e: MIDIOutputChangeEvent) =>
          setOutputs(e.outputs),
        );
      } catch (e) {
        console.error("Failed to get MIDI access", e);
      }
    }

    init();
    return () => controller?.destroy();
  }, []);

  const handleMIDIMessage = useCallback((e: MIDIMessage) => {
    setMessage(e);
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
                  controller
                    ?.input({ name: entry.name })
                    ?.channel(1)
                    .addListener(handleMIDIMessage);
                } else {
                  controller
                    ?.input({ name: entry.name })
                    ?.channel(1)
                    .removeListener(handleMIDIMessage);
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
                controller?.output({ name: entry.name })?.noteOn(60, 1);
              }}
              onMouseUp={() => {
                controller?.output({ name: entry.name })?.noteOff(60, 1);
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
