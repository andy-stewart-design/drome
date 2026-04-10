<script lang="ts">
	import { onMount } from 'svelte';
	import { createCodeMirror } from '@drome/editor';

	let editorEl: HTMLDivElement;

	onMount(() => {
		createCodeMirror(editorEl, 'console.log("hello from drome editor");\n');
	});
</script>

<h1 class="sr-only">Drome REPL</h1>
<div class="grid">
	<div bind:this={editorEl} class="container"></div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		height: 100dvh;
	}

	.container {
		height: 100%;
		overflow: hidden;
	}
</style>
