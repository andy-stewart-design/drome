<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getSketch, type Sketch } from '@/db';
	import Editor from '@/components/editor/index.svelte';

	let sketch: Sketch | null = $state(null);

	onMount(async () => {
		const tid = page.params.tid;
		if (!tid) {
			goto('/new', { replaceState: true });
			return;
		}
		const result = await getSketch(tid);
		if (!result) {
			goto('/new', { replaceState: true });
			return;
		}
		sketch = result;
	});
</script>

{#if sketch}
	<Editor initialCode={sketch.code} tid={sketch.tid} />
{/if}
