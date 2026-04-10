<script lang="ts">
	import { onMount } from 'svelte';
	import { createCodeMirror } from '@drome/editor';
	import AudioVisualizer from '@drome/audio-visualizer';
	import type Drome from 'drome-live';

	let container: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let editor: ReturnType<typeof createCodeMirror> | null = $state(null);
	let drome: Drome | null = $state(null);

	onMount(() => {
		let visualizer: AudioVisualizer | null = null;

		async function init() {
			const { default: Drome } = await import('drome-live');
			drome = await Drome.init(120);

			const analyser = drome.getAnalyzer();
			visualizer = new AudioVisualizer({
				analyzer: analyser,
				canvas,
				type: 'curve',
				bgLCH: [0.1822, 0, 0]
			});
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
				e.preventDefault();
				togglePlaystate(false);
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
			visualizer?.destroy();
		};
	});

	$effect(() => {
		console.log(editor?.state.doc.toString());
		console.log(drome);
	});
</script>

<h1 class="sr-only">Drome REPL</h1>
<div class="grid">
	<div bind:this={container} class="container"></div>
	<aside>
		<div class="visualizer"><canvas bind:this={canvas}></canvas></div>
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

	.visualizer {
		display: grid;

		&::after {
			grid-area: 1/-1;
			content: '';
			display: block;
			border-block-end: 1px solid rgb(255 255 255 / 0.1);
		}
	}
	canvas {
		grid-area: 1/-1;
		width: 100%;
		display: block;
		aspect-ratio: 4/3;
	}
</style>
