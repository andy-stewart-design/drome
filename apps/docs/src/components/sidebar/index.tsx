import { For } from "solid-js";
import type { TreeItem } from "@/utils/sidebar";
import s from "./style.module.css";
import type { CollectionEntry } from "astro:content";

interface SidebarProps<T extends CollectionEntry<"docs">> {
  tree: TreeItem<T>[];
}

function Sidebar<T extends CollectionEntry<"docs">>(props: SidebarProps<T>) {
  return (
    <ul class={s.fileTree}>
      <For each={props.tree}>
        {(node) => (
          <li>
            {node.type === "folder" ? (
              <details class={s.details} open>
                <summary class={s.summary}>
                  {node.id.split("-").join(" ")}
                </summary>
                <Sidebar tree={node.items} />
              </details>
            ) : (
              <a href={`/docs/${node.id}`} class={s.fileItem}>
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
