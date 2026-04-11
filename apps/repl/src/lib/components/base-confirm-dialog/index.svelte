<script lang="ts">
	import BaseDialog from '@/components/base-dialog/index.svelte';

	let {
		open = $bindable(false),
		message,
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		onconfirm,
		oncancel
	}: {
		open?: boolean;
		message: string;
		confirmLabel?: string;
		cancelLabel?: string;
		onconfirm: () => void;
		oncancel?: () => void;
	} = $props();

	function handleConfirm() {
		open = false;
		onconfirm();
	}

	function handleCancel() {
		open = false;
		oncancel?.();
	}
</script>

<BaseDialog bind:open>
	<p class="message">{message}</p>
	<div class="actions">
		<button type="button" onclick={handleCancel}>{cancelLabel}</button>
		<button type="button" class="confirm" onclick={handleConfirm}>{confirmLabel}</button>
	</div>
</BaseDialog>

<style>
	.message {
		margin: 0 0 1rem;
		font-size: 0.875rem;
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

	.confirm {
		background: rgb(255 255 255 / 0.15);
	}
</style>
