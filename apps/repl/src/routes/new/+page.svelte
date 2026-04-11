<script lang="ts">
	import Editor from '@/components/editor/index.svelte';

	const DEFAULT_CODE = 'd.synth("tri").root("a3").scale("min").note([0,2,4,6]).push()';
</script>

<Editor initialCode={DEFAULT_CODE} />
