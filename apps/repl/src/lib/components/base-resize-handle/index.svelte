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

<div
	class="handle"
	class:dragging
	role="separator"
	aria-orientation="vertical"
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
></div>

<style>
	.handle {
		width: 6px;
		cursor: col-resize;
		background: transparent;
		border-inline: 1px solid rgb(255 255 255 / 0.1);
		flex-shrink: 0;
	}

	.handle:hover,
	.handle.dragging {
		background: rgb(255 255 255 / 0.1);
	}
</style>
