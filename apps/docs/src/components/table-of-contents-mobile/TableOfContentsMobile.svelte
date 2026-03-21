<script lang="ts">
  interface Heading {
    depth: number;
    slug: string;
    text: string;
  }

  interface Props {
    headings: Heading[];
  }

  let { headings }: Props = $props();

  const Y_OFF = 8;

  const filtered = $derived(headings.filter((h) => h.depth >= 2 && h.depth <= 3));
  let current = $state<Heading | undefined>(undefined);
  let position = $state({ x: 0, y: 0 });
  let open = $state(false);
  let popoverRef = $state<HTMLElement | null>(null);

  $effect(() => {
    const headings = filtered; // reactive dependency — re-runs on navigation
    current = headings[0];

    const headingEls = [
      ...document.querySelectorAll<HTMLElement>("article h2[id], article h3[id]"),
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
    if (open) popoverRef?.hidePopover();
    else popoverRef?.showPopover();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    position = { x: rect.left, y: rect.top + rect.height + Y_OFF };
  }

  function scrollTo(e: MouseEvent, slug: string) {
    e.preventDefault();
    const target = document.getElementById(slug);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 48;
    window.scrollTo({ top, behavior: "smooth" });
    history.pushState(null, "", `#${slug}`);
  }
</script>

{#if filtered.length > 0}
  <div class="container">
    <div class="main">
      <button onclick={togglePopover}>On this page</button>
      {current?.text ?? filtered[0]?.text}
    </div>
    <nav
      popover="auto"
      bind:this={popoverRef}
      ontoggle={(e) => { open = (e as ToggleEvent).newState === "open"; }}
      class="popover"
      style="left: {position.x}px; top: {position.y}px;"
    >
      <ul class="list">
        {#each filtered as heading}
          <li class:depth3={heading.depth === 3}>
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
  </div>
{/if}

<style>
  .container {
    position: sticky;
    top: var(--app-editor-header-height);
    background: var(--app-color-bg-primary);
    padding-block: var(--spacing-3);
    padding-inline: var(--app-padding-inline);
    border-block-end: 1px solid var(--app-color-border-subtle);
    z-index: 2;

    @media (width > 1280px) {
      display: none;
    }
  }

  .main {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    font-size: 13px;
  }

  .main button {
    font-size: inherit;
    background: var(--app-color-bg-secondary);
    padding: var(--spacing-1) var(--spacing-2);
    border: none;
  }

  .popover {
    margin: 0;
    background: var(--app-color-bg-secondary);
    padding: var(--spacing-3) var(--spacing-4);
    border: none;
    border-radius: var(--spacing-1);
  }

  .popover ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .popover a {
    text-decoration: none;
  }

  .list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .depth3 a {
    padding-inline-start: var(--spacing-3);
    font-size: 0.8125rem;
  }

  .active {
    color: var(--app-color-accent-primary);
  }
</style>
