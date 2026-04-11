<script lang="ts">
	import type Drome from 'drome-live';
	import AudioVisualizer from '@drome/audio-visualizer';

	let {
		drome,
		visualizer = $bindable<AudioVisualizer | null>(null)
	}: { drome: Drome | null; visualizer?: AudioVisualizer | null } = $props();

	let canvas: HTMLCanvasElement;

	$effect(() => {
		if (!drome) return;

		const analyser = drome.getAnalyzer();
		visualizer = new AudioVisualizer({
			analyzer: analyser,
			canvas,
			type: 'curve',
			bgLCH: [0.1822, 0, 0],
			fgLCH: [0.6, 0, 0]
		});

		return () => {
			visualizer?.destroy();
			visualizer = null;
		};
	});
</script>

<div class="visualizer"><canvas bind:this={canvas}></canvas></div>

<style>
	.visualizer {
		display: grid;

		&::after {
			grid-area: 1/-1;
			content: '';
			display: block;
			border-block-end: 1px solid oklch(var(--app-color-neutral-950-lch) / 0.1);
		}
	}
	canvas {
		grid-area: 1/-1;
		width: 100%;
		display: block;
		aspect-ratio: 4/3;
	}
</style>
