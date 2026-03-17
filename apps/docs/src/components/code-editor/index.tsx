import { createSignal, onMount, createUniqueId } from "solid-js";
import { useStore } from "@nanostores/solid";

import IconPause20 from "@/components/icons/icon-pause-20";
import IconPlay20 from "@/components/icons/icon-play-20";
import { drome, paused, queued, activeEditor } from "@/stores/drome";
import { createCodeMirror } from "@/utils/codemirror";

import type { EditorView } from "codemirror";

import "@/utils/codemirror/theme.css";
import s from "./style.module.css";
import IconRefresh20 from "../icons/icon-refresh-20";

function CodeEditor(props: { code: string }) {
  const id = createUniqueId();
  const [editor, setEditor] = createSignal<EditorView | null>(null);
  const $drome = useStore(drome);
  const $paused = useStore(paused);
  const $queued = useStore(queued);
  const $activeEditor = useStore(activeEditor);
  let containerRef: HTMLDivElement | undefined;

  const isActive = () => id === $activeEditor();
  const isPlaying = () => !$paused() && isActive();
  const isQueued = () => $queued() && isActive();

  onMount(() => {
    if (!containerRef) return;

    setEditor(createCodeMirror(containerRef, props.code.trim()));
  });

  function play() {
    if (!$paused()) queued.set(true);
    const ed = editor();
    const d = $drome();
    if (!d || !ed) return;
    d.evaluate(ed.state.doc.toString());
    d.start();
    activeEditor.set(id);
  }

  function stop() {
    $drome()?.stop();
  }

  function togglePlay() {
    if (isPlaying()) stop();
    else play();
  }

  return (
    <div>
      <div class={s.header}>
        <div>
          <button onClick={togglePlay} disabled={isQueued()}>
            {isPlaying() ? <IconPause20 /> : <IconPlay20 />}
          </button>
          <button onClick={play} disabled={!isPlaying() || isQueued()}>
            <IconRefresh20 />
          </button>
        </div>
        {isQueued() && <span class={s.queued}>Queued</span>}
      </div>
      <div ref={containerRef} class={s.editor} />
    </div>
  );
}

export default CodeEditor;
