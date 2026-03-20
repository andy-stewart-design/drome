import { createSignal, onCleanup, onMount, For, Show } from "solid-js";
import s from "./style.module.css";

interface Heading {
  depth: number;
  slug: string;
  text: string;
}

function TableOfContents(props: { headings: Heading[] }) {
  const filtered = () =>
    props.headings.filter((h) => h.depth >= 2 && h.depth <= 3);
  const [activeId, setActiveId] = createSignal<string | null>(
    filtered()[0].slug,
  );

  onMount(() => {
    const headingEls = [
      ...document.querySelectorAll<HTMLElement>(
        "article h2[id], article h3[id]",
      ),
    ];

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      },
      { rootMargin: "0px 0px -66% 0px" },
    );

    headingEls.forEach((h) => observer.observe(h));
    onCleanup(() => observer.disconnect());
  });

  return (
    <Show when={filtered().length > 0}>
      <nav>
        <p class={s.label}>On this page</p>
        <ul class={s.list}>
          <For each={filtered()}>
            {(heading) => (
              <li class={heading.depth === 3 ? s.depth3 : undefined}>
                <a
                  href={`#${heading.slug}`}
                  class={activeId() === heading.slug ? s.active : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById(heading.slug);
                    if (!target) return;
                    const top =
                      target.getBoundingClientRect().top + window.scrollY - 48;
                    window.scrollTo({ top, behavior: "smooth" });
                    history.pushState(null, "", `#${heading.slug}`);
                  }}
                >
                  {heading.text}
                </a>
              </li>
            )}
          </For>
        </ul>
      </nav>
    </Show>
  );
}

export default TableOfContents;
