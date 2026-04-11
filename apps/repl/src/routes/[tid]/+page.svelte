<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getSketch } from '$lib/db';
	import Editor from '@/components/editor/index.svelte';

	let code: string | null = $state(null);

	onMount(async () => {
		const tid = page.params.tid;
		if (!tid) {
			goto('/new', { replaceState: true });
			return;
		}
		const sketch = await getSketch(tid);
		if (!sketch) {
			goto('/new', { replaceState: true });
			return;
		}
		code = sketch.code;
	});
</script>

{#if code !== null}
	<Editor initialCode={code} />
{/if}
