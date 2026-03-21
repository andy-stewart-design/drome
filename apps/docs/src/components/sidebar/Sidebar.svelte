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
  {#each tree as node}
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
          <span class="bullet">
            {currentPath === `/docs/${node.id}` ? "●" : "○"}
          </span>
          {node.data.title}
        </a>
      {/if}
    </li>
  {/each}
</ul>

<style>
  .fileTree {
    list-style-type: none;
    padding: 0;
    padding-inline: var(--app-padding-inline);
    margin: 0;
  }

  .details {
    line-height: 1;
    padding-block-start: 0.75lh;
  }

  .summary {
    font-size: 0.875rem;
    padding-block: 0.375rem;
    cursor: pointer;
    list-style: none;
    color: var(--app-color-fg-tertiary);
    user-select: none;
  }

  .summary::-webkit-details-marker {
    display: none;
  }

  .fileItem {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    padding-block: 0.375rem;
    color: var(--app-color-fg-secondary);
    font-size: 1rem;
    line-height: 1;
    text-transform: lowercase;
    text-decoration: none;
    width: fit-content;
    user-select: none;
  }

  .fileItem:hover {
    color: var(--app-color-fg-primary);
  }

  .bullet {
    font-size: 0.75rem;
    padding-block-end: 0.125lh;
  }

  .active {
    color: var(--app-color-fg-primary);
    font-weight: 500;
  }
</style>
