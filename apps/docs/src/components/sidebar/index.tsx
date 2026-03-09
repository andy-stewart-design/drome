import { For } from "solid-js";
import type { TreeItem } from "@/utils/sidebar";
import styles from "./style.module.css";

interface SidebarProps<T extends { id: string }> {
  tree: TreeItem<T>[];
}

function Sidebar<T extends { id: string }>(props: SidebarProps<T>) {
  return (
    <ul class={styles.fileTree}>
      <For each={props.tree}>
        {(node) => (
          <li>
            {node.type === "folder" ? (
              <details open>
                <summary class={styles.summary}>
                  <strong>{node.id.split("/").pop()}</strong>
                </summary>
                <Sidebar tree={node.items} />
              </details>
            ) : (
              <span class={styles.fileItem}>{node.id.split("/").pop()}</span>
            )}
          </li>
        )}
      </For>
    </ul>
  );
}

export default Sidebar;
