function clamp(num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

function squash(x: number) {
  return x / (1 + x);
}

function map(
  value: number,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number,
) {
  return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
}

export { clamp, map, mod, squash };
