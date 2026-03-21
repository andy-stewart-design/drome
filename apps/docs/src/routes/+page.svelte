<script>
  import Header from "$components/Header.svelte";
  import CodeEditor from "$components/code-editor/CodeEditor.svelte";
  import { SITE_TITLE, SITE_DESCRIPTION } from "$lib/consts.js";
</script>

<svelte:head>
  <title>{SITE_TITLE}</title>
  <meta name="description" content={SITE_DESCRIPTION} />
</svelte:head>

<Header />
<main>
  <h1 style="text-align: center;">Drome</h1>
  <p style="text-align: center;">
    A minimalist live coding language for the web
  </p>
  <CodeEditor code="d.synth().note([60,64,67,71]).push()" />
</main>

<style>
  main {
    max-width: 800px;
    margin-inline: auto;
    padding-inline: var(--app-padding-inline);
  }
</style>
