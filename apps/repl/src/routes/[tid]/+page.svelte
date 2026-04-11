<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { getSketch, type Sketch } from '@/db';
	import Editor from '@/components/editor/index.svelte';

	let sketch: Sketch | null = $state(null);

	$effect(() => {
		const tid = page.params.tid;
		if (!tid) {
			goto('/new', { replaceState: true });
			return;
		}

		getSketch(tid).then((result) => {
			if (!result) {
				goto('/new', { replaceState: true });
				return;
			}
			sketch = result;
		});
	});
</script>

{#if sketch}
	{#key sketch.tid}
		<Editor initialCode={sketch.code} tid={sketch.tid} />
	{/key}
{/if}
