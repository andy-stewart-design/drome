<script lang="ts">
	import BaseDialog from '@/components/base-dialog/index.svelte';

	let {
		open = $bindable(false),
		onsave
	}: {
		open?: boolean;
		onsave: (title: string) => void;
	} = $props();

	let titleInput = $state('');

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!titleInput.trim()) return;
		onsave(titleInput.trim());
		titleInput = '';
		open = false;
	}

	function handleCancel() {
		titleInput = '';
		open = false;
	}
</script>

<BaseDialog bind:open>
	<form onsubmit={handleSubmit}>
		<label>
			Title
			<input type="text" bind:value={titleInput} required />
		</label>
		<div class="actions">
			<button type="button" onclick={handleCancel}>Cancel</button>
			<button type="submit">Save</button>
		</div>
	</form>
</BaseDialog>

<style>
	label {
		display: block;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	input {
		display: block;
		width: 100%;
		margin-top: 0.25rem;
		padding: 0.5rem;
		border: 1px solid rgb(255 255 255 / 0.2);
		border-radius: 4px;
		background: rgb(255 255 255 / 0.05);
		color: inherit;
		font-size: 0.875rem;
	}

	input:focus {
		outline: 1px solid rgb(255 255 255 / 0.4);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	button {
		padding: 0.375rem 0.75rem;
		border: 1px solid rgb(255 255 255 / 0.2);
		border-radius: 4px;
		background: rgb(255 255 255 / 0.05);
		color: inherit;
		font-size: 0.875rem;
		cursor: pointer;
	}

	button[type='submit'] {
		background: rgb(255 255 255 / 0.15);
	}
</style>
