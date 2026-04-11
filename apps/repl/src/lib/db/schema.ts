export interface Sketch {
	tid: string;
	title: string;
	code: string;
	origin: string | null;
	originDid: string | null;
	originDisplayName: string | null;
	description: string | null;
	tags: string[] | null;
	publishedUri: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export type NewSketch = Pick<Sketch, 'title' | 'code'> &
	Partial<Pick<Sketch, 'origin' | 'originDid' | 'originDisplayName' | 'description' | 'tags'>>;
