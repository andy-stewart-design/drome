import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Sketch } from './schema.js';
import { migrations } from './migrations.js';

export interface DromeDB extends DBSchema {
	sketches: {
		key: string;
		value: Sketch;
		indexes: {
			'by-updatedAt': string;
			'by-title': string;
			'by-publishedUri': string;
			'by-deletedAt': string;
		};
	};
}

const DB_NAME = 'drome-repl';

let dbPromise: Promise<IDBPDatabase<DromeDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<DromeDB>> {
	if (!dbPromise) {
		dbPromise = openDB<DromeDB>(DB_NAME, migrations.length, {
			upgrade(db, oldVersion, newVersion) {
				const target = newVersion ?? migrations.length;
				for (let i = oldVersion; i < target; i++) {
					migrations[i](db);
				}
			}
		});
	}
	return dbPromise;
}
