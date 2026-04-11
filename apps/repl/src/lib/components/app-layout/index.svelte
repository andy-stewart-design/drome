<script lang="ts">
	import type { Snippet } from 'svelte';
	import ResizeHandle from '@/components/base-resize-handle/index.svelte';

	let {
		children,
		sidebar,
		sidebarWidth = $bindable(320)
	}: { children: Snippet; sidebar: Snippet; sidebarWidth?: number } = $props();

	function handleResize(delta: number) {
		sidebarWidth = Math.max(200, Math.min(600, sidebarWidth - delta));
	}
</script>

<div class="grid" style:grid-template-columns="minmax(0, 1fr) auto {sidebarWidth}px">
	<main>{@render children()}</main>
	<ResizeHandle onresize={handleResize} />
	<aside>{@render sidebar()}</aside>
</div>

<style>
	.grid {
		display: grid;
		height: 100dvh;
	}

	main {
		height: 100%;
		overflow: hidden;
	}

	aside {
		overflow: hidden;
	}
</style>
