<script lang="ts">
	import { onMount } from 'svelte';
	import { beforeNavigate } from '$app/navigation';
	import { createCodeMirror } from '@drome/editor';
	import { EditorView } from '@codemirror/view';
	import { StateEffect } from '@codemirror/state';
	import { getDromeContext } from '$lib/context/drome.svelte';
	import { getSketchContext } from '$lib/context/sketch.svelte';
	import { createSketch, updateSketch } from '$lib/db';
	import SaveSketchDialog from '@/components/save-sketch-dialog/index.svelte';

	let { initialCode = '', tid = null }: { initialCode?: string; tid?: string | null } = $props();

	const ctx = getDromeContext();
	const sketchCtx = getSketchContext();

	let container: HTMLDivElement;
	let editor: EditorView | null = $state(null);
	let evaluating = $state(false);
	let timeoutId: ReturnType<typeof setTimeout>;

	let savedCode = $state('');
	let currentCode = $state('');
	let currentTid: string | null = $state(null);
	let isDirty = $derived(currentCode !== savedCode);

	let saveDialogOpen = $state(false);

	function togglePlaystate(pause?: boolean) {
		if (!ctx.drome || !editor) return;
		const shouldPause = pause ?? !ctx.drome.paused;

		if (shouldPause) {
			ctx.drome.stop();
			ctx.visualizer?.stop();
		} else {
			const code = editor.state.doc.toString();
			ctx.drome.evaluate(code);
			if (ctx.drome.paused) ctx.drome.start();
			ctx.visualizer?.start();
		}
	}

	async function save() {
		if (!editor) return;

		const code = editor.state.doc.toString();

		if (currentTid) {
			await updateSketch(currentTid, { code });
			savedCode = code;
			sketchCtx.refresh();
		} else {
			saveDialogOpen = true;
		}
	}

	async function handleSave(title: string) {
		if (!editor) return;

		const code = editor.state.doc.toString();
		const sketch = await createSketch({ title, code });
		currentTid = sketch.tid;
		savedCode = code;
		sketchCtx.currentTid = sketch.tid;
		sketchCtx.refresh();
		history.replaceState(null, '', `/${sketch.tid}`);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.altKey && e.key === 'ß') {
			e.preventDefault();
			save();
		} else if (e.altKey && e.key === 'Enter') {
			if (timeoutId) clearTimeout(timeoutId);
			e.preventDefault();
			togglePlaystate(false);
			evaluating = true;
			timeoutId = setTimeout(() => {
				evaluating = false;
			}, 300);
		} else if (e.altKey && e.key === '÷') {
			e.preventDefault();
			togglePlaystate(true);
		}
	}

	function handleBeforeUnload(e: BeforeUnloadEvent) {
		if (isDirty) {
			e.preventDefault();
		}
	}

	beforeNavigate((navigation) => {
		if (isDirty) {
			if (!confirm('You have unsaved changes. Discard and leave?')) {
				navigation.cancel();
			}
		}
	});

	onMount(() => {
		savedCode = initialCode;
		currentCode = initialCode;
		currentTid = tid ?? null;
		sketchCtx.currentTid = currentTid;

		const view = createCodeMirror(container, initialCode);
		editor = view;

		const onUpdate = EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				currentCode = update.state.doc.toString();
			}
		});
		view.dispatch({ effects: StateEffect.appendConfig.of(onUpdate) });
	});
</script>

<svelte:window onkeydown={handleKeyDown} onbeforeunload={handleBeforeUnload} />

<h1 class="sr-only">Drome REPL</h1>
<div bind:this={container} class="container" data-evaluating={evaluating}></div>

<SaveSketchDialog bind:open={saveDialogOpen} onsave={handleSave} />

<style>
	.container {
		height: 100%;
		overflow: hidden;
	}
</style>
