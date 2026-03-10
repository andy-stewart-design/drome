import { For } from "solid-js";
import type { TreeItem } from "@/utils/sidebar";
import styles from "./style.module.css";
import type { CollectionEntry } from "astro:content";

interface SidebarProps<T extends { id: string }> {
  tree: TreeItem<T>[];
}

function Sidebar<T extends CollectionEntry<"docs">>(props: SidebarProps<T>) {
  return (
    <ul class={styles.fileTree}>
      <For each={props.tree}>
        {(node) => (
          <li>
            {node.type === "folder" ? (
              <details open>
                <summary class={styles.summary}>
                  <strong>{node.id.split("-").join(" ")}</strong>
                </summary>
                <Sidebar tree={node.items} />
              </details>
            ) : (
              <a href={`/docs/${node.id}`} class={styles.fileItem}>
                {node.data.title}
              </a>
            )}
          </li>
        )}
      </For>
    </ul>
  );
}

export default Sidebar;
