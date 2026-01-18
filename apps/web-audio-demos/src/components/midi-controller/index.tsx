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

        controller.subscribe("inputchange", (ports: MIDIInput[]) =>
          setInputs(ports),
        );

        controller.subscribe("outputchange", (ports: MIDIOutput[]) =>
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
                    ?.input(entry.name ?? entry.id)
                    ?.channel(1)
                    .subscribe(handleMIDIMessage);
                } else {
                  const { id } = entry;
                  controller
                    ?.input(entry.name ?? entry.id)
                    ?.channel(1)
                    .unsubscribe(handleMIDIMessage);
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
                controller
                  ?.output(entry.name ?? entry.id)
                  ?.channel(1)
                  .noteOn(60);
              }}
              onMouseUp={() => {
                controller
                  ?.output(entry.name ?? entry.id)
                  ?.channel(1)
                  .noteOff(60);
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
