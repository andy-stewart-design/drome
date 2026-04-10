<script lang="ts">
	import { onMount } from 'svelte';
	import { createCodeMirror } from '@drome/editor';
	import type Drome from 'drome-live';

	let container: HTMLDivElement;
	let editor: ReturnType<typeof createCodeMirror> | null = $state(null);
	let drome: Drome | null = $state(null);

	onMount(() => {
		async function init() {
			const { default: Drome } = await import('drome-live');
			drome = await Drome.init(120);
		}

		function togglePlaystate(e: KeyboardEvent) {
			if (!(e.altKey && e.key === 'Enter')) return;
			if (drome && !drome.paused) {
				console.log('stopping');
				drome.stop();
				// v?.stop();
			} else if (drome && editor) {
				console.log('starting');
				const code = editor.state.doc.toString();
				drome.evaluate(code);
				// flash();
				if (drome.paused) drome.start();
				// if (v?.paused) v?.start();
			}
		}

		editor = createCodeMirror(
			container,
			'd.synth("tri").root("a3").scale("min").note([0,2,4,6]).push()'
		);
		init();

		window.addEventListener('keydown', togglePlaystate);
		return () => window.removeEventListener('keydown', togglePlaystate);
	});

	$effect(() => {
		console.log(editor?.state.doc.toString());
		console.log(drome);
	});
</script>

<h1 class="sr-only">Drome REPL</h1>
<div class="grid">
	<div bind:this={container} class="container"></div>
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
