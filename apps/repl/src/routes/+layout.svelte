<script lang="ts">
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import '@/styles/tokens.css';
	import '@/styles/global.css';
	import AppLayout from '@/components/app-layout/index.svelte';
	import Visualizer from '@/components/visualizer/index.svelte';
	import SketchList from '@/components/sketch-list/index.svelte';
	import { setDromeContext } from '$lib/context/drome.svelte';
	import { setSketchContext } from '$lib/context/sketch.svelte';
	import { cleanupDeletedSketches } from '$lib/db';

	let { children } = $props();

	const ctx = setDromeContext();
	setSketchContext();

	onMount(() => {
		async function init() {
			const { default: Drome } = await import('drome-live');
			ctx.drome = await Drome.init(120);
		}

		init();
		cleanupDeletedSketches();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<AppLayout>
	{@render children()}
	{#snippet sidebar()}
		<div class="sidebar-stack">
			<Visualizer />
			<div class="sketch-list-pane">
				<SketchList />
			</div>
		</div>
	{/snippet}
</AppLayout>

<style>
	.sidebar-stack {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	.sketch-list-pane {
		flex: 1;
		min-height: 0;
		overflow: hidden;
		border-block-start: 1px solid rgb(255 255 255 / 0.1);
	}
</style>
