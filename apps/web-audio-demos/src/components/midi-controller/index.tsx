import { useEffect, useState, useCallback } from "react";
import MIDIController from "@/classes/midi-controller";
import type { MIDIMessage } from "@/classes/midi-controller/types";

export default function MidiController() {
  const [controller, setController] = useState<MIDIController | null>(null);
  const [inputs, setInputs] = useState<MIDIInput[]>([]);
  const [outputs, setOutputs] = useState<MIDIOutput[]>([]);
  const [message, setMessage] = useState<MIDIMessage | null>(null);

  useEffect(() => {
    let controller: MIDIController | undefined;

    async function init() {
      try {
        controller = await MIDIController.init();

        setController(controller);
        setInputs(controller.inputs);
        setOutputs(controller.outputs);

        controller.addListener("input-change", (ports: MIDIInput[]) =>
          setInputs(ports),
        );

        controller.addListener("output-change", (ports: MIDIOutput[]) =>
          setOutputs(ports),
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
      <h2>Inputs</h2>
      <ul>
        {inputs.map((entry) => (
          <li key={entry.id}>
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  const { id } = entry;
                  controller
                    ?.input(entry.name ?? { id })
                    ?.channel(1)
                    .addListener(handleMIDIMessage);
                } else {
                  const { id } = entry;
                  controller
                    ?.input(entry.name ?? { id })
                    ?.channel(1)
                    .removeListener(handleMIDIMessage);
                }
              }}
            />
            {entry.name} ({entry.id})
          </li>
        ))}
      </ul>
      <h2>Outputs</h2>
      <ul>
        {outputs.map((entry) => (
          <li key={entry.id}>
            {entry.name} ({entry.id})
            <button
              onMouseDown={() => {
                const { id } = entry;
                controller?.output(entry.name ?? { id })?.noteOn(60, 1);
              }}
              onMouseUp={() => {
                const { id } = entry;
                controller?.output(entry.name ?? { id })?.noteOff(60, 1);
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
