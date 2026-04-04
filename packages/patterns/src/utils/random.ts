const PERIOD = 300;
const SEED_MAX = 2 ** 29;

function xorwise(x: number): number {
  const a = (x << 13) ^ x;
  const b = (a >> 17) ^ a;
  return (b << 5) ^ b;
}

const frac = (n: number) => n - Math.trunc(n);

function getSeed(n: number): number {
  const value = n % PERIOD === 0 ? 0x9e3779b9 / PERIOD : n / PERIOD;
  return xorwise(Math.trunc(frac(value) * SEED_MAX));
}

const seedToRand = (seed: number) => (seed % SEED_MAX) / SEED_MAX;

type RandMapper = (r: number, start: number, end: number) => number;

const floatMapper: RandMapper = (r, start, end) => r * (end - start) + start;
const intMapper: RandMapper = (r, start, end) =>
  Math.floor(r * (end - start) + start);
const binaryMapper: RandMapper = (r) => Math.round(r);

export {
  xorwise,
  getSeed,
  seedToRand,
  floatMapper,
  intMapper,
  binaryMapper,
  type RandMapper,
};
