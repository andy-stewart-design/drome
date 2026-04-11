import { setContext, getContext } from 'svelte';
import type Drome from 'drome-live';
import type AudioVisualizer from '@drome/audio-visualizer';

const KEY = Symbol('drome');

interface DromeContext {
	drome: Drome | null;
	visualizer: AudioVisualizer | null;
}

export function setDromeContext() {
	const ctx = $state<DromeContext>({ drome: null, visualizer: null });
	setContext(KEY, ctx);
	return ctx;
}

export function getDromeContext(): DromeContext {
	return getContext<DromeContext>(KEY);
}
