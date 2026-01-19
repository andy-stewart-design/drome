import { useEffect, useState, useRef, useCallback } from "react";
import MIDIController from "@/classes/midi-controller";
import MIDIController2 from "@/classes/midi-controller-2";
import MIDIOberserver from "@/classes/midi-controller-2/midi-observer";
import type { MIDIMessage } from "@/classes/midi-controller/types";

export default function MidiController() {
  const [controller, setController] = useState<MIDIController2 | null>(null);
  const [inputs, setInputs] = useState<MIDIInput[]>([]);
  const [outputs, setOutputs] = useState<MIDIOutput[]>([]);
  const [message, setMessage] = useState<MIDIMessage | null>(null);
  const observerRef = useRef<Map<string, MIDIOberserver<any>>>(new Map());

  useEffect(() => {
    let controller: MIDIController2;
    let observer: MIDIOberserver<"portchange">;

    async function init() {
      try {
        controller = await MIDIController2.init();

        setController(controller);
        setInputs(controller.inputs);
        setOutputs(controller.outputs);

        observer = new MIDIOberserver("portchange").onUpdate(
          ({ portType, ports }) => {
            if (portType === "input") setInputs(ports);
            else setOutputs(ports);
          },
        );

        controller.addObserver(observer);
      } catch (e) {
        console.error("Failed to get MIDI access", e);
      }
    }

    init();

    return () => {
      controller.removeObserver(observer);
      controller.destroy();
    };
  }, []);

  const handleMIDIMessage = useCallback((e: MIDIMessage) => {
    setMessage(e);
  }, []);

  return (
    <div>
      <h2>Inputs</h2>
      <ul>
        {inputs.map((port) => (
          <li key={port.id}>
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  const noteObs = new MIDIOberserver("note", port.id).onUpdate(
                    handleMIDIMessage,
                  );
                  const ccObs = new MIDIOberserver(
                    "controlchange",
                    port.id,
                  ).onUpdate(handleMIDIMessage);
                  controller?.addObserver(noteObs)?.addObserver(ccObs);
                  observerRef.current.set(`note-${port.id}`, noteObs);
                  observerRef.current.set(`cc-${port.id}`, ccObs);
                } else {
                  const noteObs = observerRef.current.get(`note-${port.id}`);
                  const ccObs = observerRef.current.get(`cc-${port.id}`);
                  if (noteObs) controller?.removeObserver(noteObs);
                  if (ccObs) controller?.removeObserver(ccObs);
                }
              }}
            />
            {port.name} ({port.id})
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
                // controller
                //   ?.output(entry.name ?? entry.id)
                //   ?.channel(1)
                //   .noteOn(60);
              }}
              onMouseUp={() => {
                // controller
                //   ?.output(entry.name ?? entry.id)
                //   ?.channel(1)
                //   .noteOff(60);
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
