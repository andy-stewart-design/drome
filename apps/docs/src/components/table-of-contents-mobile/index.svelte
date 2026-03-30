<script lang="ts">
  import { replaceState } from "$app/navigation";
  import IconChevronRight16 from "$components/icons/icon-chevron-right-16.svelte";
  import SidebarMobile from "$components/sidebar-mobile/index.svelte";
  import { scrollTo } from "$lib/utils/scroll-to";
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

  let current = $state<Heading | undefined>(undefined);
  let position = $state({ x: 0, y: 0 });
  let width = $state(0);
  let open = $state(false);

  // svelte-ignore non_reactive_update
  let popoverRef: HTMLElement;
  // svelte-ignore non_reactive_update
  let buttonRef: HTMLElement;

  const filtered = $derived(
    headings.filter((h) => h.depth >= 2 && h.depth <= 3),
  );

  function lightDismissOnClick(e: PointerEvent) {
    if (!(e.target instanceof HTMLElement)) return;
    const isClickInside = buttonRef.contains(e.target);
    if (open && !isClickInside) popoverRef?.hidePopover();
  }

  function lightDismissOnKey(e: KeyboardEvent) {
    if (open && e.key === "Escape") {
      popoverRef?.hidePopover();
      buttonRef?.focus();
    }
  }

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

    document.addEventListener("click", lightDismissOnClick);
    document.addEventListener("keydown", lightDismissOnKey);
    headingEls.forEach((h) => observer.observe(h));

    return () => {
      observer.disconnect();
      document.removeEventListener("click", lightDismissOnClick);
      document.removeEventListener("keydown", lightDismissOnKey);
    };
  });

  function togglePopover(e: MouseEvent) {
    const button = e.currentTarget;
    if (!(button instanceof HTMLButtonElement)) return;

    const rect = button.getBoundingClientRect();
    const parentRect = button.parentElement?.getBoundingClientRect() ?? rect;

    if (open) {
      popoverRef?.hidePopover();
    } else {
      position = { x: rect.left, y: rect.top + rect.height };
      width = parentRect.width;
      popoverRef?.showPopover();
    }
  }

  function reposition() {
    if (!open || !buttonRef) return;
    const rect = buttonRef.getBoundingClientRect();
    const pRect = buttonRef.parentElement?.getBoundingClientRect() ?? rect;
    position = { x: rect.left, y: rect.top + rect.height };
    width = pRect.width;
  }
</script>

<svelte:window onresize={reposition} />

<div class="container">
  {#if filtered.length > 0}
    <button
      bind:this={buttonRef}
      onclick={togglePopover}
      data-state={open ? "open" : "closed"}
    >
      <IconChevronRight16 />
      <span>{current?.text ?? filtered[0]?.text}</span>
    </button>
    <nav
      popover="manual"
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
      gap: var(--spacing-1);
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
