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
			visualizer = new AudioVisualizer({ analyzer: analyser, canvas, type: 'curve' });
		}

		function togglePlaystate(e: KeyboardEvent) {
			if (!(e.altKey && e.key === 'Enter')) return;
			if (drome && !drome.paused) {
				console.log('stopping');
				drome.stop();
				visualizer?.stop();
			} else if (drome && editor) {
				console.log('starting');
				const code = editor.state.doc.toString();
				drome.evaluate(code);
				if (drome.paused) drome.start();
				visualizer?.start();
			}
		}

		editor = createCodeMirror(
			container,
			'd.synth("tri").root("a3").scale("min").note([0,2,4,6]).push()'
		);
		init();

		window.addEventListener('keydown', togglePlaystate);
		return () => {
			window.removeEventListener('keydown', togglePlaystate);
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
		<canvas bind:this={canvas}></canvas>
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

	canvas {
		width: 100%;
		display: block;
		aspect-ratio: 4/3;
	}
</style>
