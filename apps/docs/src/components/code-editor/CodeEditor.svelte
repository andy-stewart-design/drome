<script lang="ts">
  import { browser } from "$app/environment";
  import { dromeState } from "../../stores/drome.svelte.js";
  import { createCodeMirror } from "$lib/utils/codemirror/index.js";
  import IconPause20 from "../icons/IconPause20.svelte";
  import IconPlay20 from "../icons/IconPlay20.svelte";
  import IconRefresh20 from "../icons/IconRefresh20.svelte";
  import type { EditorView } from "codemirror";
  import "$lib/utils/codemirror/theme.css";

  interface Props {
    code: string;
  }

  let { code }: Props = $props();

  const id = crypto.randomUUID();
  let editor = $state<EditorView | null>(null);
  let containerRef = $state<HTMLDivElement | null>(null);

  const isActive = $derived(id === dromeState.activeEditor);
  const isPlaying = $derived(!dromeState.paused && isActive);
  const isQueued = $derived(dromeState.queued && isActive);

  $effect(() => {
    if (!browser || !containerRef) return;
    editor = createCodeMirror(containerRef, code.trim());
    return () => editor?.destroy();
  });

  function play() {
    if (!dromeState.paused) dromeState.queued = true;
    if (!dromeState.drome || !editor) return;
    dromeState.drome.evaluate(editor.state.doc.toString());
    dromeState.drome.start();
    dromeState.activeEditor = id;
  }

  function stop() {
    dromeState.drome?.stop();
  }

  function togglePlay() {
    if (isPlaying) stop();
    else play();
  }
</script>

<div>
  <div class="header">
    <div>
      <button onclick={togglePlay} disabled={isQueued}>
        {#if isPlaying}
          <IconPause20 />
        {:else}
          <IconPlay20 />
        {/if}
      </button>
      <button onclick={play} disabled={!isPlaying || isQueued}>
        <IconRefresh20 />
      </button>
    </div>
    {#if isQueued}
      <span class="queued">Queued</span>
    {/if}
  </div>
  <div bind:this={containerRef} class="editor"></div>
</div>

<style>
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-2) var(--spacing-3);
    border: 1px solid var(--app-color-border-subtle);
    border-block-end: none;
    border-radius: var(--spacing-2) var(--spacing-2) 0 0;
  }

  .header button {
    display: inline-flex;
    align-items: center;
    background: none;
    border: none;
    padding: var(--spacing-1_5);
  }

  .editor {
    border: 1px solid var(--app-color-border-subtle);
    border-radius: 0 0 var(--spacing-2) var(--spacing-2);
    overflow: clip;
  }

  .queued {
    display: inline-block;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--app-color-fg-secondary);
    padding: 0 var(--spacing-2) 1px;
  }
</style>
