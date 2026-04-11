import { setContext, getContext } from 'svelte';
import { listSketches, type Sketch } from '$lib/db';

const KEY = Symbol('sketch');

type SortBy = 'updatedAt' | 'title';

interface SketchContext {
	currentTid: string | null;
	sketches: Sketch[];
	sortBy: SortBy;
	refresh: () => Promise<void>;
}

export function setSketchContext() {
	const ctx = $state<SketchContext>({
		currentTid: null,
		sketches: [],
		sortBy: 'updatedAt',
		refresh: async () => {
			ctx.sketches = await listSketches(ctx.sortBy);
		}
	});
	setContext(KEY, ctx);
	return ctx;
}

export function getSketchContext(): SketchContext {
	return getContext<SketchContext>(KEY);
}
