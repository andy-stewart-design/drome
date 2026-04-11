<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		open = $bindable(false)
	}: {
		children: Snippet;
		open?: boolean;
	} = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (open) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});

	function handleClose() {
		open = false;
	}
</script>

<dialog bind:this={dialog} onclose={handleClose}>
	{@render children()}
</dialog>

<style>
	dialog {
		border: none;
		outline: 1px solid rgb(255 255 255 / 0.2);
		border-radius: 8px;
		background: var(--app-color-bg-primary);
		color: var(--app-color-fg-primary);
		padding: 1.5rem;
		min-width: 300px;
	}

	dialog::backdrop {
		background: rgb(0 0 0 / 0.5);
		backdrop-filter: blur(4px);
	}
</style>
