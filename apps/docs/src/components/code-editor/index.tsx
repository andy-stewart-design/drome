import { createSignal, createEffect } from "solid-js";
import { useStore } from "@nanostores/solid";
import { drome, paused } from "@/stores/drome";

function CodeEditor({ code: _code }: { code: string }) {
  const [code, setCode] = createSignal(_code);
  const $drome = useStore(drome);
  const $paused = useStore(paused);
  let ref: HTMLTextAreaElement | undefined;

  createEffect(() => {
    if (ref) ref.value = code();
  });

  function handlePlay() {
    const d = $drome();
    if (!d) return;
    d.evaluate(code());
    d.start();
  }

  function handleStop() {
    $drome()?.stop();
  }

  return (
    <div>
      <button onClick={handlePlay}>{$paused() ? "Play" : "Eval"}</button>
      <button onClick={handleStop}>Stop</button>
      <textarea ref={ref} onInput={(e) => setCode(e.currentTarget.value)} />
    </div>
  );
}

export default CodeEditor;
