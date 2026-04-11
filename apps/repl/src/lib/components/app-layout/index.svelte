<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, sidebar }: { children: Snippet; sidebar: Snippet } = $props();
</script>

<div class="grid">
	<main>{@render children()}</main>
	<aside>{@render sidebar()}</aside>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 320px;
		height: 100dvh;
	}

	main {
		height: 100%;
		overflow: hidden;
	}

	aside {
		border-inline-start: 1px solid rgb(255 255 255 / 0.1);
	}
</style>
