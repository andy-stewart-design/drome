<script lang="ts">
	import { onMount } from 'svelte';
	import { createCodeMirror } from '@drome/editor';
	import { getDromeContext } from '$lib/drome-context.svelte';

	let { initialCode = '' }: { initialCode?: string } = $props();

	const ctx = getDromeContext();

	let container: HTMLDivElement;
	let editor: ReturnType<typeof createCodeMirror> | null = $state(null);
	let evaluating = $state(false);
	let timeoutId: ReturnType<typeof setTimeout>;

	function togglePlaystate(pause?: boolean) {
		if (!ctx.drome || !editor) return;
		const shouldPause = pause ?? !ctx.drome.paused;

		if (shouldPause) {
			ctx.drome.stop();
			ctx.visualizer?.stop();
		} else {
			const code = editor.state.doc.toString();
			ctx.drome.evaluate(code);
			if (ctx.drome.paused) ctx.drome.start();
			ctx.visualizer?.start();
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.altKey && e.key === 'Enter') {
			if (timeoutId) clearTimeout(timeoutId);
			e.preventDefault();
			togglePlaystate(false);
			evaluating = true;
			timeoutId = setTimeout(() => {
				evaluating = false;
			}, 300);
		} else if (e.altKey && e.key === '÷') {
			e.preventDefault();
			togglePlaystate(true);
		}
	}

	onMount(() => {
		editor = createCodeMirror(container, initialCode);
	});
</script>

<svelte:window onkeydown={handleKeyDown} />

<h1 class="sr-only">Drome REPL</h1>
<div bind:this={container} class="container" data-evaluating={evaluating}></div>

<style>
	.container {
		height: 100%;
		overflow: hidden;
	}
</style>
