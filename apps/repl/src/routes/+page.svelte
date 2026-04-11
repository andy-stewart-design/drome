<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { listSketches } from '$lib/db';

	onMount(async () => {
		const sketches = await listSketches();
		if (sketches.length > 0) {
			goto(`/${sketches[0].tid}`, { replaceState: true });
		} else {
			goto('/new', { replaceState: true });
		}
	});
</script>
