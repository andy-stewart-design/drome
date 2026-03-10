import { For } from "solid-js";
import type { TreeItem } from "@/utils/sidebar";
import s from "./style.module.css";
import type { CollectionEntry } from "astro:content";

interface SidebarProps<T extends CollectionEntry<"docs">> {
  tree: TreeItem<T>[];
  currentPath: string;
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
                <Sidebar tree={node.items} currentPath={props.currentPath} />
              </details>
            ) : (
              <a
                href={`/docs/${node.id}`}
                class={`${s.fileItem}${props.currentPath === `/docs/${node.id}` ? ` ${s.active}` : ""}`}
              >
                <span class={s.bullet}>
                  {props.currentPath === `/docs/${node.id}` ? "●" : "○"}
                </span>
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
