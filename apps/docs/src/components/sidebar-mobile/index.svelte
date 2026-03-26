<script lang="ts">
  import type { TreeItem } from "$lib/sidebar.js";
  import type { DocEntry } from "$lib/content.js";
  import Sidebar from "$components/sidebar/index.svelte";
  import IconHamburger from "$components/icons/icon-hamburger-16.svelte";
  import { afterNavigate } from "$app/navigation";

  interface Props {
    tree: TreeItem<DocEntry>[];
    currentPath: string;
  }

  let { tree, currentPath }: Props = $props();

  let dialog: HTMLDialogElement;

  const open = () => dialog?.showModal();
  const close = () => dialog?.close();
  const onDialogClick = (e: MouseEvent) => e.target === dialog && close();

  afterNavigate(() => close());
</script>

<button class="trigger" onclick={open} aria-label="Open navigation">
  <IconHamburger />
</button>

<dialog bind:this={dialog} onclick={onDialogClick}>
  <div class="panel">
    <div class="header">
      <button class="close" onclick={close} aria-label="Close navigation">
        ×
      </button>
    </div>
    <nav>
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
