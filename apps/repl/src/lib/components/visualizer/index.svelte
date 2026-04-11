<script lang="ts">
	import AudioVisualizer from '@drome/audio-visualizer';
	import { getDromeContext } from '$lib/context/drome.svelte';
	import { parseLCH } from '@/utils/parse-lch';

	const ctx = getDromeContext();

	let canvas: HTMLCanvasElement;

	$effect(() => {
		if (!ctx.drome) return;

		const styles = getComputedStyle(canvas);
		const bgLCH = parseLCH(styles.getPropertyValue('--app-color-neutral-950-lch'));
		const fgLCH = parseLCH(styles.getPropertyValue('--app-color-neutral-50-lch'));

		const analyser = ctx.drome.getAnalyzer();
		ctx.visualizer = new AudioVisualizer({
			analyzer: analyser,
			canvas,
			type: 'curve',
			bgLCH,
			fgLCH
		});

		return () => {
			ctx.visualizer?.destroy();
			ctx.visualizer = null;
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
			border-block-end: 1px solid oklch(var(--app-color-neutral-50-lch) / 0.1);
		}
	}
	canvas {
		grid-area: 1/-1;
		width: 100%;
		display: block;
		aspect-ratio: 3/2;
		max-block-size: 560px;
	}
</style>
