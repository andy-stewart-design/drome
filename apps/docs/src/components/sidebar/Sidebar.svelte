<script lang="ts">
  import type { TreeItem } from "$lib/sidebar.js";
  import type { DocEntry } from "$lib/content.js";
  import Sidebar from "./Sidebar.svelte";

  interface Props {
    tree: TreeItem<DocEntry>[];
    currentPath: string;
  }

  let { tree, currentPath }: Props = $props();
</script>

<ul class="fileTree">
  {#each tree as node (node.id)}
    <li>
      {#if node.type === "folder"}
        <details class="details" open>
          <summary class="summary">
            {node.id.split("/").at(-1)?.split("-").join(" ")}
          </summary>
          <Sidebar tree={node.items} {currentPath} />
        </details>
      {:else}
        <a
          href="/docs/{node.id}"
          class="fileItem"
          class:active={currentPath === `/docs/${node.id}`}
        >
          {node.data.title}
        </a>
      {/if}
    </li>
  {/each}
</ul>

<style>
  .fileTree {
    --padding-inline: calc(var(--app-padding-inline) / 2);
    --item-border-width: 3px;

    list-style-type: none;
    padding-inline: var(--padding-inline);
    margin: 0;

    :global(ul) {
      padding: 0;
    }

    li:not(:last-of-type) {
      margin-block-end: var(--spacing-0_5);
    }
  }

  .details {
    line-height: 1;
    padding-block-start: var(--spacing-3);
  }

  .summary {
    font-size: var(--font-size-4xs);
    letter-spacing: 0.1em;
    padding-block: var(--spacing-3);
    padding-inline: var(--padding-inline);
    color: var(--app-color-fg-tertiary);
    text-transform: uppercase;
    list-style: none;
    user-select: none;
    border-inline-start: var(--item-border-width) solid transparent;

    &::-webkit-details-marker {
      display: none;
    }
  }

  .fileItem {
    --border-color: transparent;

    position: relative;
    display: flex;
    align-items: center;
    gap: var(--spacing-2);
    padding-block: var(--spacing-2);
    padding-inline-end: var(--padding-inline);
    color: var(--app-color-fg-tertiary);
    font-size: var(--font-size-xs);
    line-height: 1;
    text-decoration: none;
    user-select: none;
    font-weight: var(--font-weight-5);
    border-radius: var(--spacing-1);

    &::before {
      content: "";
      height: 1.25lh;
      width: var(--item-border-width);
      background: var(--border-color);
    }

    &:hover {
      background: var(--app-color-bg-secondary);
    }

    &.active {
      --border-color: var(--app-color-fg-primary);
      color: var(--app-color-fg-primary);
      background: var(--app-color-bg-secondary);
    }
  }
</style>
