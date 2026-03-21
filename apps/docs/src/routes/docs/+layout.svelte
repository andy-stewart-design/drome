<script lang="ts">
  import { page } from "$app/stores";
  import Header from "$components/Header.svelte";
  import Footer from "$components/Footer.svelte";
  import Sidebar from "$components/sidebar/Sidebar.svelte";
  import TableOfContents from "$components/table-of-contents/TableOfContents.svelte";
  import TableOfContentsMobile from "$components/table-of-contents-mobile/TableOfContentsMobile.svelte";

  let { data, children } = $props();

  const pageData = $derived(
    $page.data as {
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
    <div class="sticky">
      <Sidebar tree={data.sidebarTree} currentPath={$page.url.pathname} />
    </div>
  </aside>
  <article class="article">
    <TableOfContentsMobile headings={pageData.headings ?? []} />
    <div class="prose">
      {#if pageData.title}
        <div class="title">
          <h1>{pageData.title}</h1>
          <div class="date">
            Last updated: {(
              pageData.updated ?? pageData.created
            )?.toLocaleDateString()}
          </div>
        </div>
      {/if}
      {@render children()}
    </div>
  </article>
  <aside class="toc">
    <div class="sticky">
      <TableOfContents headings={pageData.headings ?? []} />
    </div>
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
    max-width: 64ch;
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
    font-size: 1rem;
    color: var(--app-color-fg-tertiary);
  }
</style>
