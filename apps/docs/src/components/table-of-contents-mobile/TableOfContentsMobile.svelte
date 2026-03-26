<script lang="ts">
  import { replaceState } from "$app/navigation";
  import IconChevronRight16 from "$components/icons/IconChevronRight16.svelte";
  import SidebarMobile from "$components/sidebar-mobile/SidebarMobile.svelte";
  import type { TreeItem } from "$lib/sidebar.js";
  import type { DocEntry } from "$lib/content.js";

  interface Heading {
    depth: number;
    slug: string;
    text: string;
  }

  interface Props {
    headings: Heading[];
    tree: TreeItem<DocEntry>[];
    currentPath: string;
  }

  let { headings, tree, currentPath }: Props = $props();

  const POPOVER_Y_OFF = 0;
  const SCROLL_Y_OFF = 40;

  let current = $state<Heading | undefined>(undefined);
  let position = $state({ x: 0, y: 0 });
  let width = $state(0);
  let open = $state(false);
  let popoverRef = $state<HTMLElement | null>(null);

  const filtered = $derived(
    headings.filter((h) => h.depth >= 2 && h.depth <= 3),
  );

  $effect(() => {
    const headings = filtered; // reactive dependency — re-runs on navigation
    current = headings[0];

    const headingEls = [
      ...document.querySelectorAll<HTMLElement>(
        "article h2[id], article h3[id]",
      ),
    ];

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const found = filtered.find((hd) => hd.slug === entry.target.id);
          if (found) current = found;
          else if (!current) current = filtered[0];
        }
      },
      { rootMargin: "0px 0px -66% 0px" },
    );

    headingEls.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  });

  function togglePopover(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const pRect =
      (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect() ??
      rect;

    if (open) {
      popoverRef?.hidePopover();
    } else {
      position = { x: rect.left, y: rect.top + rect.height + POPOVER_Y_OFF };
      width = pRect.width;
      popoverRef?.showPopover();
    }
  }

  function scrollTo(e: MouseEvent, slug: string) {
    e.preventDefault();
    const target = document.getElementById(slug);
    if (!target) return;

    const root = document.documentElement;
    const rem = parseFloat(getComputedStyle(root).fontSize);
    const headerHeight =
      parseFloat(
        getComputedStyle(root).getPropertyValue("--app-editor-header-height"),
      ) * rem;
    const tocHeight =
      parseFloat(
        getComputedStyle(root).getPropertyValue("--app-toc-mobile-height"),
      ) * rem;

    const top =
      target.getBoundingClientRect().top +
      window.scrollY -
      headerHeight -
      tocHeight -
      SCROLL_Y_OFF;

    window.scrollTo({ top, behavior: "smooth" });
    replaceState(`#${slug}`, {});
  }
</script>

<div class="container">
  {#if filtered.length > 0}
    <button onclick={togglePopover} data-state={open ? "open" : "closed"}>
      <IconChevronRight16 />
      {current?.text ?? filtered[0]?.text}
    </button>
    <nav
      popover="auto"
      bind:this={popoverRef}
      ontoggle={(e) => {
        open = (e as ToggleEvent).newState === "open";
      }}
      class="popover"
      style="left: {position.x}px; top: {position.y}px; width: {width}px"
    >
      <ul class="list">
        {#each filtered as heading (heading.slug)}
          <li class="item" data-depth={heading.depth}>
            <a
              href="#{heading.slug}"
              class:active={(current ?? filtered[0])?.slug === heading.slug}
              onclick={(e) => scrollTo(e, heading.slug)}
            >
              {heading.text}
            </a>
          </li>
        {/each}
      </ul>
    </nav>
  {/if}
  <SidebarMobile {tree} {currentPath} />
</div>

<style>
  .container {
    position: sticky;
    top: var(--app-editor-header-height);
    block-size: var(--app-toc-mobile-height);
    display: flex;
    justify-content: space-between;
    background: var(--app-color-bg-primary);
    border-block-end: 1px solid var(--app-color-border-subtle);
    z-index: 2;

    @media (width > 1280px) {
      display: none;
    }

    button {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-5);
      padding: var(--spacing-1) var(--app-padding-inline);
      background: none;
      border: none;

      &[data-state="open"] :global(svg) {
        rotate: 90deg;
      }
    }
  }

  .popover {
    margin: 0;
    background: var(--app-color-bg-primary);
    padding: 0;
    border: none;
    width: 100%;
    border-block: 1px solid var(--app-color-border-subtle);
  }

  .popover a {
    display: block;
    text-decoration: none;
    font-size: var(--font-size-xs);
    padding-block: var(--spacing-2);
    width: 100%;
  }

  .list {
    list-style: none;
    margin: 0;
    padding-block: var(--spacing-1);
    padding-inline: var(--app-padding-inline) 0;
  }

  .item:not(:last-of-type) {
    &[data-depth="3"] {
      padding-inline-start: 2ch;
    }

    a {
      border-block-end: 1px solid var(--app-color-border-subtle);
    }
  }

  .active {
    color: var(--app-color-accent-primary);
  }
</style>
