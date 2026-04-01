import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { workletIds } from "../constants";

let SuperSawOscillatorProcessor: any;

beforeAll(async () => {
  await import("./worklet-supersaw");
  SuperSawOscillatorProcessor = (globalThis as any).__processors[workletIds.supersaw];
});

beforeEach(() => {
  (globalThis as any).currentTime = 1; // past any default startTime of 0
  (globalThis as any).sampleRate = 44100;
});

const BLOCK = 128;

function makeParams(overrides: Partial<Record<string, number>> = {}) {
  const defaults = {
    start: 0,
    stop: Number.POSITIVE_INFINITY,
    frequency: 440,
    panspread: 0.4,
    freqspread: 0.2,
    detune: 0,
    voices: 7,
  };
  const merged = { ...defaults, ...overrides };
  return Object.fromEntries(
    Object.entries(merged).map(([k, v]) => [k, new Float32Array([v as number])]),
  );
}

function makeOutput() {
  return [new Float32Array(BLOCK), new Float32Array(BLOCK)]; // stereo
}

describe("SuperSawOscillatorProcessor", () => {
  it("registers under the expected processor id", () => {
    expect(SuperSawOscillatorProcessor).toBeDefined();
  });

  it("generates non-zero stereo output when active", () => {
    const proc = new SuperSawOscillatorProcessor();
    const output = makeOutput();
    proc.process([], [output], makeParams());
    expect(output[0].some((s) => s !== 0)).toBe(true);
    expect(output[1].some((s) => s !== 0)).toBe(true);
  });

  it("outputs silence when currentTime <= startTime", () => {
    (globalThis as any).currentTime = 0;
    const proc = new SuperSawOscillatorProcessor();
    const output = makeOutput();
    proc.process([], [output], makeParams({ start: 10 }));
    expect(output[0].every((s) => s === 0)).toBe(true);
    expect(output[1].every((s) => s === 0)).toBe(true);
  });

  it("returns false and posts 'ended' when stop time is reached", () => {
    const messages: any[] = [];
    const proc = new SuperSawOscillatorProcessor();
    proc.port.postMessage = (msg: any) => messages.push(msg);
    const result = proc.process([], [makeOutput()], makeParams({ stop: 0 }));
    expect(result).toBe(false);
    expect(messages).toContainEqual(expect.objectContaining({ type: "ended" }));
  });

  it("left and right channel outputs differ (panning active)", () => {
    const proc = new SuperSawOscillatorProcessor();
    const output = makeOutput();
    proc.process([], [output], makeParams({ panspread: 0.4 }));
    // With panning, L and R should not be identical
    const diff = output[0].reduce((acc, s, i) => acc + Math.abs(s - output[1][i]), 0);
    expect(diff).toBeGreaterThan(0);
  });

  it("freqspread=0 with 2 voices produces symmetric L/R output", () => {
    const proc = new SuperSawOscillatorProcessor();
    const output = makeOutput();
    // With freqspread=0 and 2 voices, both voices have identical frequency
    // and pan alternates L/R symmetrically
    proc.process([], [output], makeParams({ freqspread: 0, voices: 2, panspread: 0.5 }));
    // L and R should be roughly equal in magnitude
    const sumL = output[0].reduce((a, s) => a + Math.abs(s), 0);
    const sumR = output[1].reduce((a, s) => a + Math.abs(s), 0);
    expect(Math.abs(sumL - sumR)).toBeLessThan(sumL * 0.1);
  });
});
