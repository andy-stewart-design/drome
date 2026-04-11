import type { IDBPDatabase } from 'idb';
import type { DromeDB } from './db.js';

type Migration = (db: IDBPDatabase<DromeDB>) => void;

export const migrations: Migration[] = [
	// v1: create sketches object store + indexes
	(db) => {
		const store = db.createObjectStore('sketches', { keyPath: 'tid' });
		store.createIndex('by-updatedAt', 'updatedAt');
		store.createIndex('by-title', 'title');
		store.createIndex('by-publishedUri', 'publishedUri');
		store.createIndex('by-deletedAt', 'deletedAt');
	}
];
