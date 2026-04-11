function parseLCH(value: string): [number, number, number] {
	const [l, c, h] = value.trim().split(/\s+/).map(Number);
	return [l, c, h];
}

export { parseLCH };
