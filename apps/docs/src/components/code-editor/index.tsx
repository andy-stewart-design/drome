import { createSignal, createEffect, onMount } from "solid-js";
import { useStore } from "@nanostores/solid";
import { drome, paused } from "@/stores/drome";
import { createCodeMirror } from "@/utils/codemirror";
import type { EditorView } from "codemirror";
import "@/utils/codemirror/theme.css";

function CodeEditor({ code: _code }: { code: string }) {
  // const [code, setCode] = createSignal(_code);
  const [editor, setEditor] = createSignal<EditorView | null>(null);
  const $drome = useStore(drome);
  const $paused = useStore(paused);
  // let ref: HTMLTextAreaElement | undefined;
  let containerRef: HTMLDivElement | undefined;

  onMount(() => {
    if (!containerRef) return;

    setEditor(createCodeMirror(containerRef, _code));
  });

  // createEffect(() => {
  //   if (ref) ref.value = code();
  // });

  function handlePlay() {
    const ed = editor();
    const d = $drome();
    if (!d || !ed) return;
    d.evaluate(ed.state.doc.toString());
    d.start();
  }

  function handleStop() {
    $drome()?.stop();
  }

  return (
    <div>
      <button onClick={handlePlay}>{$paused() ? "Play" : "Eval"}</button>
      <button onClick={handleStop}>Stop</button>
      <div
        ref={containerRef}
        style={{ border: "1px solid var(--app-color-border-subtle)" }}
      />
    </div>
  );
}

export default CodeEditor;
