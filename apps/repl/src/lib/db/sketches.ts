import { TID } from '@atproto/common-web';
import { getDB } from './db.js';
import type { Sketch, NewSketch } from './schema.js';

const CLEANUP_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createSketch(input: NewSketch): Promise<Sketch> {
	const db = await getDB();
	const now = new Date().toISOString();
	const sketch: Sketch = {
		tid: TID.nextStr(),
		title: input.title,
		code: input.code,
		origin: input.origin ?? null,
		originDid: input.originDid ?? null,
		originDisplayName: input.originDisplayName ?? null,
		description: input.description ?? null,
		tags: input.tags ?? null,
		publishedUri: null,
		createdAt: now,
		updatedAt: now,
		deletedAt: null
	};
	await db.put('sketches', sketch);
	return sketch;
}

export async function getSketch(tid: string): Promise<Sketch | undefined> {
	const db = await getDB();
	return db.get('sketches', tid);
}

export async function updateSketch(
	tid: string,
	changes: Partial<Omit<Sketch, 'tid' | 'createdAt'>>
): Promise<Sketch> {
	const db = await getDB();
	const existing = await db.get('sketches', tid);
	if (!existing) {
		throw new Error(`Sketch not found: ${tid}`);
	}
	const updated: Sketch = {
		...existing,
		...changes,
		updatedAt: new Date().toISOString()
	};
	await db.put('sketches', updated);
	return updated;
}

export async function softDeleteSketch(tid: string): Promise<void> {
	const db = await getDB();
	const existing = await db.get('sketches', tid);
	if (!existing) {
		throw new Error(`Sketch not found: ${tid}`);
	}
	await db.put('sketches', {
		...existing,
		deletedAt: new Date().toISOString(),
		updatedAt: new Date().toISOString()
	});
}

export async function listSketches(
	sortBy: 'updatedAt' | 'title' = 'updatedAt'
): Promise<Sketch[]> {
	const db = await getDB();
	const index = sortBy === 'title' ? 'by-title' : 'by-updatedAt';
	const all = await db.getAllFromIndex('sketches', index);
	const filtered = all.filter((s) => s.deletedAt === null);
	return sortBy === 'updatedAt' ? filtered.reverse() : filtered;
}

export async function cleanupDeletedSketches(): Promise<number> {
	const db = await getDB();
	const cutoff = new Date(Date.now() - CLEANUP_THRESHOLD_MS).toISOString();
	const tx = db.transaction('sketches', 'readwrite');
	const index = tx.store.index('by-deletedAt');

	let cursor = await index.openCursor();
	let count = 0;

	while (cursor) {
		const sketch = cursor.value;
		if (sketch.deletedAt !== null && sketch.deletedAt < cutoff) {
			await cursor.delete();
			count++;
		}
		cursor = await cursor.continue();
	}

	await tx.done;
	return count;
}
