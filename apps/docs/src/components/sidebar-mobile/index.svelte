<script lang="ts">
  import type { TreeItem } from "$lib/sidebar.js";
  import type { DocEntry } from "$lib/content.js";
  import Sidebar from "$components/sidebar/index.svelte";

  interface Props {
    tree: TreeItem<DocEntry>[];
    currentPath: string;
  }

  let { tree, currentPath }: Props = $props();

  let dialog = $state<HTMLDialogElement | null>(null);

  function open() {
    dialog?.showModal();
  }

  function close() {
    dialog?.close();
  }

  function onDialogClick(e: MouseEvent) {
    if (e.target === dialog) {
      close();
    }
  }

  function onNavClick(e: MouseEvent) {
    if ((e.target as HTMLElement).closest("a")) {
      close();
    }
  }
</script>

<button class="trigger" onclick={open} aria-label="Open navigation">
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <rect x="2" y="3" width="12" height="1.5" rx="0.75" fill="currentColor" />
    <rect
      x="2"
      y="7.25"
      width="12"
      height="1.5"
      rx="0.75"
      fill="currentColor"
    />
    <rect
      x="2"
      y="11.5"
      width="12"
      height="1.5"
      rx="0.75"
      fill="currentColor"
    />
  </svg>
</button>

<dialog bind:this={dialog} onclick={onDialogClick}>
  <div class="panel">
    <div class="header">
      <button class="close" onclick={close} aria-label="Close navigation">
        ×
      </button>
    </div>
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
    <nav onclick={onNavClick}>
      <Sidebar {tree} {currentPath} />
    </nav>
  </div>
</dialog>

<style>
  .trigger {
    display: flex;
    align-items: center;
    padding: var(--spacing-1) var(--app-padding-inline);
    background: none;
    border: none;
    color: var(--app-color-fg-tertiary);

    &:hover {
      color: var(--app-color-fg-primary);
    }

    @media (width > 768px) {
      display: none;
    }
  }

  dialog {
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    max-block-size: 100dvh;
    block-size: 100dvh;
    inline-size: min(320px, 85vw);
    inset-inline-start: 0;
    inset-block-start: 0;

    &::backdrop {
      background: oklch(0% 0 0 / 40%);
    }
  }

  .panel {
    block-size: 100%;
    background: var(--app-color-bg-primary);
    border-inline-end: 1px solid var(--app-color-border-subtle);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    block-size: var(--app-editor-header-height);
    padding-inline: var(--app-padding-inline);
    border-block-end: 1px solid var(--app-color-border-subtle);
    flex-shrink: 0;
  }

  .close {
    background: none;
    border: none;
    font-size: 1.25rem;
    line-height: 1;
    padding: var(--spacing-1);
    color: var(--app-color-fg-tertiary);
    cursor: pointer;

    &:hover {
      color: var(--app-color-fg-primary);
    }
  }

  nav {
    overflow-y: auto;
    flex: 1;
    padding-block: var(--spacing-6);
  }
</style>
