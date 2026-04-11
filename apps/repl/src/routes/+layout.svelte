<script lang="ts">
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import '@/styles/tokens.css';
	import '@/styles/global.css';
	import AppLayout from '@/components/app-layout.svelte';
	import Visualizer from '@/components/visualizer/index.svelte';
	import { setDromeContext } from '$lib/drome-context.svelte';

	let { children } = $props();

	const ctx = setDromeContext();

	onMount(() => {
		async function init() {
			const { default: Drome } = await import('drome-live');
			ctx.drome = await Drome.init(120);
		}

		init();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<AppLayout>
	{@render children()}
	{#snippet sidebar()}
		<Visualizer />
	{/snippet}
</AppLayout>
