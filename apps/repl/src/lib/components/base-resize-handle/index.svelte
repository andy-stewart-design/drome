<script lang="ts">
	let { onresize }: { onresize: (delta: number) => void } = $props();

	let dragging = $state(false);
	let startX = 0;

	function handlePointerDown(e: PointerEvent) {
		dragging = true;
		startX = e.clientX;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!dragging) return;
		const delta = e.clientX - startX;
		startX = e.clientX;
		onresize(delta);
	}

	function handlePointerUp() {
		dragging = false;
	}
</script>

<div class="container">
	<div
		class="handle"
		class:dragging
		role="separator"
		aria-orientation="vertical"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
	></div>
</div>

<style>
	.container {
		display: flex;
		justify-content: flex-end;
		width: 1px;
		z-index: 2;
	}

	.handle {
		height: 100%;
		width: 8px;
		cursor: col-resize;
		background: transparent;
		border-inline-end: 1px solid rgb(255 255 255 / 0.1);
		flex-shrink: 0;

		&:is(:hover, .dragging) {
			background: oklch(var(--app-color-neutral-50-lch) / 0.1);
		}
	}
</style>
