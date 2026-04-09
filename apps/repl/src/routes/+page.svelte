<script lang="ts">
	import { onMount } from 'svelte';
	import { createCodeMirror } from '@drome/editor';

	let editorEl: HTMLDivElement;

	onMount(() => {
		createCodeMirror(editorEl, 'console.log("hello from drome editor");\n');
	});
</script>

<h1>REPL</h1>
<div bind:this={editorEl}></div>
