import { createSignal, onCleanup, onMount, For, Show } from "solid-js";
import s from "./style.module.css";

interface Heading {
  depth: number;
  slug: string;
  text: string;
}

const Y_OFF = 8;

function TableOfContentsMobile(props: { headings: Heading[] }) {
  const filtered = () =>
    props.headings.filter((h) => h.depth >= 2 && h.depth <= 3);
  const [current, setCurrent] = createSignal<Heading>(filtered()[0]);
  const [position, setPosition] = createSignal({ x: 0, y: 0 });
  const [open, setOpen] = createSignal(false);
  let popoverRef: HTMLElement | undefined;

  onMount(() => {
    const headingEls = [
      ...document.querySelectorAll<HTMLElement>(
        "article h2[id], article h3[id]",
      ),
    ];

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const current = filtered().find((hd) => hd.slug === entry.target.id);
          if (current) setCurrent(current);
        }
      },
      { rootMargin: "0px 0px -66% 0px" },
    );

    headingEls.forEach((h) => observer.observe(h));
    onCleanup(() => observer.disconnect());
  });

  return (
    <Show when={filtered().length > 0}>
      <div class={s.container}>
        <div class={s.main}>
          <button
            onClick={(e) => {
              if (open()) popoverRef?.hidePopover();
              else popoverRef?.showPopover();

              const rect = e.currentTarget.getBoundingClientRect();
              setPosition({ x: rect.left, y: rect.top + rect.height + Y_OFF });
            }}
          >
            On this page
          </button>{" "}
          {current().text}
        </div>
        <nav
          popover
          onToggle={(event) => {
            setOpen(event.newState === "open");
          }}
          ref={popoverRef}
          class={s.popover}
          style={{
            left: `${position().x}px`,
            top: `${position().y}px`,
          }}
        >
          <ul class={s.list}>
            <For each={filtered()}>
              {(heading) => (
                <li class={heading.depth === 3 ? s.depth3 : undefined}>
                  <a
                    href={`#${heading.slug}`}
                    class={
                      current().slug === heading.slug ? s.active : undefined
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      const target = document.getElementById(heading.slug);
                      if (!target) return;
                      const top =
                        target.getBoundingClientRect().top +
                        window.scrollY -
                        48;
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
      </div>
    </Show>
  );
}

export default TableOfContentsMobile;
