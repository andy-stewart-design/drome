<script lang="ts">
	import { onMount } from 'svelte';
	import { createCodeMirror } from '@drome/editor';
	import Visualizer from '@/components/visualizer/index.svelte';
	import type AudioVisualizer from '@drome/audio-visualizer';
	import type Drome from 'drome-live';

	let container: HTMLDivElement;
	let editor: ReturnType<typeof createCodeMirror> | null = $state(null);
	let drome: Drome | null = $state(null);
	let visualizer: AudioVisualizer | null = $state(null);
	let evaluating = $state(false);
	let timeoutId: ReturnType<typeof setTimeout>;

	onMount(() => {
		async function init() {
			const { default: Drome } = await import('drome-live');
			drome = await Drome.init(120);
		}

		function togglePlaystate(pause?: boolean) {
			if (!drome || !editor) return;
			const shouldPause = pause ?? !drome.paused;

			if (shouldPause) {
				console.log('stopping');
				drome.stop();
				visualizer?.stop();
			} else {
				console.log('starting');
				const code = editor.state.doc.toString();
				drome.evaluate(code);
				if (drome.paused) drome.start();
				visualizer?.start();
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

		editor = createCodeMirror(
			container,
			'd.synth("tri").root("a3").scale("min").note([0,2,4,6]).push()'
		);
		init();

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<h1 class="sr-only">Drome REPL</h1>
<div class="grid">
	<div bind:this={container} class="container" data-evaluating={evaluating}></div>
	<aside>
		<Visualizer {drome} bind:visualizer />
	</aside>
</div>

<style>
	.grid {
		display: grid;
		/*grid-template-columns: minmax(0, 1fr);*/
		grid-template-columns: minmax(0, 1fr) 320px;
		height: 100dvh;
	}

	.container {
		height: 100%;
		overflow: hidden;
	}

	aside {
		border-inline-start: 1px solid rgb(255 255 255 / 0.1);
	}
</style>
