<script lang="ts">
	import { getSketchContext } from '$lib/context/sketch.svelte';
	import { onMount } from 'svelte';

	const ctx = getSketchContext();

	onMount(() => {
		ctx.refresh();
	});

	function toggleSort() {
		ctx.sortBy = ctx.sortBy === 'updatedAt' ? 'title' : 'updatedAt';
		ctx.refresh();
	}

	function formatDate(iso: string): string {
		const date = new Date(iso);
		return date.toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		});
	}
</script>

<div class="sketch-list">
	<header>
		<span class="label">Sketches</span>
		<button class="sort-toggle" onclick={toggleSort}>
			{ctx.sortBy === 'updatedAt' ? 'Recent' : 'A–Z'}
		</button>
	</header>
	<ul>
		{#each ctx.sketches as sketch (sketch.tid)}
			<li>
				<a
					class="sketch-item"
					class:active={sketch.tid === ctx.currentTid}
					href="/{sketch.tid}"
				>
					<span class="title">{sketch.title}</span>
					<span class="date">{formatDate(sketch.updatedAt)}</span>
				</a>
			</li>
		{:else}
			<li class="empty">No saved sketches</li>
		{/each}
	</ul>
</div>

<style>
	.sketch-list {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.75rem;
		border-block-end: 1px solid rgb(255 255 255 / 0.1);
		flex-shrink: 0;
	}

	.label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.6;
	}

	.sort-toggle {
		font-size: 0.75rem;
		padding: 0.125rem 0.375rem;
		border: 1px solid rgb(255 255 255 / 0.15);
		border-radius: 3px;
		background: transparent;
		color: inherit;
		cursor: pointer;
		opacity: 0.6;
	}

	.sort-toggle:hover {
		opacity: 1;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		overflow-y: auto;
		flex: 1;
	}

	li {
		list-style: none;
	}

	.sketch-item {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		width: 100%;
		padding: 0.5rem 0.75rem;
		background: transparent;
		color: inherit;
		text-decoration: none;
		font-size: 0.8125rem;
	}

	.sketch-item:hover {
		background: rgb(255 255 255 / 0.05);
	}

	.sketch-item.active {
		background: rgb(255 255 255 / 0.1);
		pointer-events: none;
	}

	.title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		flex: 1;
		min-width: 0;
	}

	.date {
		font-size: 0.6875rem;
		opacity: 0.5;
		flex-shrink: 0;
		margin-inline-start: 0.5rem;
	}

	.empty {
		padding: 1rem 0.75rem;
		font-size: 0.8125rem;
		opacity: 0.4;
	}
</style>
