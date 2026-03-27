<script lang="ts">
  import { scrollTo } from "$lib/utils/scroll-to";

  interface Heading {
    depth: number;
    slug: string;
    text: string;
  }

  interface Props {
    headings: Heading[];
  }

  let { headings }: Props = $props();

  const filtered = $derived(
    headings.filter((h) => h.depth >= 2 && h.depth <= 3),
  );
  let activeId = $state<string | null>(null);

  $effect(() => {
    const headings = filtered; // reactive dependency — re-runs on navigation
    activeId = headings[0]?.slug ?? null;

    const headingEls = [
      ...document.querySelectorAll<HTMLElement>(
        "article h2[id], article h3[id]",
      ),
    ];

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          activeId = entry.target.id;
        }
      },
      { rootMargin: "0px 0px -66% 0px" },
    );

    headingEls.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  });
</script>

{#if filtered.length > 0}
  <nav>
    <p class="label">On this page</p>
    <ul class="list">
      {#each filtered as heading (heading.slug)}
        <li class:depth3={heading.depth === 3}>
          <a
            href="#{heading.slug}"
            class:active={activeId === heading.slug}
            onclick={(e) => scrollTo(e, heading.slug)}
          >
            {heading.text}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style>
  .label {
    font-family: monospace;
    font-size: var(--font-size-4xs);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--app-color-fg-tertiary);
    margin-block-end: var(--spacing-3);
  }

  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-1);
  }

  .list a {
    display: block;
    font-size: var(--font-size-xs);
    color: var(--app-color-fg-tertiary);
    text-decoration: none;
    line-height: 1.4;
    padding-block: var(--spacing-0_5);
  }

  .list a:hover {
    color: var(--app-color-fg-primary);
  }

  .list a.active {
    color: var(--app-color-accent-primary);
  }

  .depth3 a {
    padding-inline-start: var(--spacing-3);
  }
</style>
