<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";
  import Header from "$components/header/index.svelte";
  import Footer from "$components/footer/index.svelte";
  import Sidebar from "$components/sidebar/index.svelte";
  import TableOfContents from "$components/table-of-contents/index.svelte";
  import TableOfContentsMobile from "$components/table-of-contents-mobile/index.svelte";

  let { data, children } = $props();

  let showDesktopToc = $state<boolean | null>(null);
  let showSidebar = $state<boolean | null>(null);

  onMount(() => {
    const tocMql = window.matchMedia("(width > 1280px)");
    showDesktopToc = tocMql.matches;
    const onTocChange = (e: MediaQueryListEvent) => { showDesktopToc = e.matches; };
    tocMql.addEventListener("change", onTocChange);

    const sidebarMql = window.matchMedia("(width > 768px)");
    showSidebar = sidebarMql.matches;
    const onSidebarChange = (e: MediaQueryListEvent) => { showSidebar = e.matches; };
    sidebarMql.addEventListener("change", onSidebarChange);

    return () => {
      tocMql.removeEventListener("change", onTocChange);
      sidebarMql.removeEventListener("change", onSidebarChange);
    };
  });

  const pageData = $derived(
    page.data as {
      title?: string;
      description?: string;
      headings?: { depth: number; slug: string; text: string }[];
      updated?: Date;
      created?: Date;
    },
  );
</script>

<svelte:head>
  <title>{pageData.title ?? "Drome Docs"}</title>
  {#if pageData.description}
    <meta name="description" content={pageData.description} />
  {/if}
</svelte:head>

<Header />
<main class="main">
  <aside class="sidebar">
    {#if showSidebar !== false}
      <div class="sticky">
        <Sidebar tree={data.sidebarTree} currentPath={page.url.pathname} />
      </div>
    {/if}
  </aside>
  <article class="article">
    {#if showDesktopToc !== true}
      <TableOfContentsMobile
        headings={pageData.headings ?? []}
        tree={data.sidebarTree}
        currentPath={page.url.pathname}
      />
    {/if}
    <div class="prose">
      {#if pageData.title}
        <div class="title">
          <h1>{pageData.title}</h1>
          <div class="date">
            Last updated: {(pageData.updated ?? pageData.created)
              ?.toLocaleDateString()
              .replaceAll("/", ".")}
          </div>
        </div>
      {/if}
      {@render children()}
    </div>
  </article>
  <aside class="toc">
    {#if showDesktopToc !== false}
      <div class="sticky">
        <TableOfContents headings={pageData.headings ?? []} />
      </div>
    {/if}
  </aside>
</main>
<Footer />

<style>
  .main {
    display: grid;
    grid-template-columns: 1fr;
    padding-block: 0;
    max-width: var(--app-max-width);
    margin-inline: auto;

    @media (width > 768px) {
      grid-template-columns: 2fr 5fr;
    }

    @media (width > 1280px) {
      grid-template-columns: 2fr 5fr 2fr;
    }
  }

  .sidebar {
    display: none;

    @media (width > 768px) {
      display: block;
    }
  }

  .sticky {
    position: sticky;
    top: var(--app-editor-header-height);
    block-size: calc(100dvh - var(--app-editor-header-height));
    max-block-size: fit-content;
    overflow-y: scroll;
    padding-block: var(--spacing-6);
  }

  .article {
    border-inline-start: 1px solid var(--app-color-border-subtle);
  }

  .prose {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1lh;
    padding-block: var(--spacing-6);
    padding-inline: var(--app-padding-inline);
  }

  .prose > :global(*) {
    margin: 0;
  }

  .prose :global(h2),
  .prose :global(h3) {
    margin-top: 1rlh;
  }

  .prose :global(p) {
    text-wrap: pretty;
  }

  .prose :global(pre) {
    margin-block: var(--spacing-1) var(--spacing-2);
  }

  .toc {
    @media (width < 1280px) {
      display: none;
    }
  }

  .title {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--spacing-4);
    padding-block-end: var(--spacing-8);
    line-height: 1;
    border-block-end: 1px solid var(--app-color-border-subtle);
  }

  .date {
    font-family: monospace;
    font-size: var(--font-size-2xs);
    color: var(--app-color-fg-tertiary);
  }
</style>
