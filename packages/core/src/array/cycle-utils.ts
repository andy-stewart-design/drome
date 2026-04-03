// Generic cycle utilities parameterized over a "step" type S.
// Flat arrays use S = T, nested arrays use S = T | T[].

export type NoteInput<S> = S | S[];
export type Cycle<S> = S[][];

export function pattern<S>(...patterns: NoteInput<S>[]) {
  return patterns.map((p) => (Array.isArray(p) ? p : [p]));
}

export function arrange<S>(...patterns: [number, NoteInput<S>][]) {
  let nextCycle: Cycle<S> = [];

  for (const [numLoops, pattern] of patterns) {
    for (let i = 0; i < numLoops; i++) {
      nextCycle.push(Array.isArray(pattern) ? pattern : [pattern]);
    }
  }

  return nextCycle;
}

export function stretch<S>(cycle: Cycle<S>, bars: number, steps = 1) {
  bars = Math.round(bars);
  steps = Math.round(steps);

  const nextCycle: S[][] = [];

  for (const pattern of cycle) {
    const expanded =
      steps > 1 ? pattern.flatMap((step) => Array(steps).fill(step)) : pattern;
    for (let k = 0; k < Math.max(bars, 1); k++) {
      nextCycle.push([...expanded]);
    }
  }

  return nextCycle;
}

export function reverse<S>(cycle: Cycle<S>) {
  return cycle
    .slice()
    .reverse()
    .map((arr) => arr?.slice().reverse());
}

export function fast<S>(
  cycle: Cycle<S>,
  nullVal: S | undefined,
  mult: number,
): Cycle<S> | null {
  if (nullVal === undefined) return null;

  mult = Math.round(mult);
  if (mult === 1) return null;
  else if (mult < 1) return slow(cycle, nullVal, 1 / mult);

  const length = Math.ceil(cycle.length / mult);
  const numLoops = mult * length;
  const nextCyle: Cycle<S> = Array.from({ length }, () => []);

  for (let i = 0; i < numLoops; i++) {
    const v = cycle[i % cycle.length];
    nextCyle[Math.floor(i / mult)].push(...v);
  }

  return nextCyle;
}

export function slow<S>(
  cycle: Cycle<S>,
  nullVal: S | undefined,
  mult: number,
): Cycle<S> | null {
  if (nullVal === undefined) return null;

  mult = Math.round(mult);
  if (mult === 1) return null;
  else if (mult < 1) return fast(cycle, nullVal, 1 / mult);

  const nextCycle: Cycle<S> = [];

  for (const pat of cycle) {
    const expanded: Cycle<S>[number] = [];
    for (let i = 0; i < pat.length * mult; i++) {
      expanded.push(i % mult === 0 ? pat[i / mult] : nullVal);
    }
    for (let k = 0; k < mult; k++) {
      nextCycle.push(expanded.slice(k * pat.length, (k + 1) * pat.length));
    }
  }

  return nextCycle;
}

export function sequence(stepCount: number, ...steps: (number | number[])[]) {
  return steps.map((p) =>
    Array.from({ length: stepCount }, (_, i) => {
      return [p].flat().includes(i) ? 1 : 0;
    }),
  );
}

export function xox(...steps: (number | number[])[] | string[]) {
  return steps.map((c) => {
    if (typeof c === "string") {
      return c.split("").reduce<number[]>((acc, s) => {
        if (s.trim()) acc.push(s.trim() === "x" ? 1 : 0);
        return acc;
      }, []);
    }
    return Array.isArray(c) ? c.map((n) => (n ? 1 : 0)) : c ? [1] : [0];
  });
}
