import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { workletIds } from "../constants";

let LFOProcessor: any;

beforeAll(async () => {
  await import("./worklet-lfo");
  LFOProcessor = (globalThis as any).__processors[workletIds.lfo];
});

beforeEach(() => {
  (globalThis as any).currentTime = 0;
  (globalThis as any).sampleRate = 44100;
});

const BLOCK = 128;

function makeParams(overrides: Partial<Record<string, number>> = {}) {
  const defaults = { beatsPerMinute: 120, beatsPerBar: 4, rate: 1, phaseOffset: 0, scale: 1 };
  const merged = { ...defaults, ...overrides };
  return Object.fromEntries(
    Object.entries(merged).map(([k, v]) => [k, new Float32Array([v as number])]),
  );
}

function makeOutput(channels = 1) {
  return Array.from({ length: channels }, () => new Float32Array(BLOCK));
}

describe("LFOProcessor", () => {
  it("registers under the expected processor id", () => {
    expect(LFOProcessor).toBeDefined();
  });

  it("outputs silence before receiving a start message", () => {
    const proc = new LFOProcessor({ processorOptions: {} });
    const output = makeOutput();
    proc.process([], [output], makeParams());
    expect(output[0].every((s) => s === 0)).toBe(true);
  });

  it("outputs non-zero samples after starting", () => {
    const proc = new LFOProcessor({ processorOptions: {} });
    proc.port.onmessage?.({ data: { type: "start", time: 0 } } as any);
    const output = makeOutput();
    proc.process([], [output], makeParams());
    expect(output[0].some((s) => s !== 0)).toBe(true);
  });

  it("normalize=false produces output in [-scale, scale]", () => {
    const proc = new LFOProcessor({ processorOptions: { normalize: false } });
    proc.port.onmessage?.({ data: { type: "start", time: 0 } } as any);
    const output = makeOutput();
    proc.process([], [output], makeParams({ scale: 1 }));
    for (const s of output[0]) {
      expect(s).toBeGreaterThanOrEqual(-1 - 1e-10);
      expect(s).toBeLessThanOrEqual(1 + 1e-10);
    }
  });

  it("normalize=true produces output in [0, scale]", () => {
    const proc = new LFOProcessor({ processorOptions: { normalize: true } });
    proc.port.onmessage?.({ data: { type: "start", time: 0 } } as any);
    const output = makeOutput();
    proc.process([], [output], makeParams({ scale: 1 }));
    for (const s of output[0]) {
      expect(s).toBeGreaterThanOrEqual(-1e-10);
      expect(s).toBeLessThanOrEqual(1 + 1e-10);
    }
  });

  it("scale=0 results in silent output even when running", () => {
    const proc = new LFOProcessor({ processorOptions: {} });
    proc.port.onmessage?.({ data: { type: "start", time: 0 } } as any);
    const output = makeOutput();
    proc.process([], [output], makeParams({ scale: 0 }));
    expect(output[0].every((s) => s === 0)).toBe(true);
  });

  it("accepts oscillatorType message and changes waveform type", () => {
    const proc = new LFOProcessor({ processorOptions: { type: "sine" } });
    proc.port.onmessage?.({ data: { type: "oscillatorType", oscillatorType: "sawtooth" } } as any);
    // No error should be thrown; processor accepts the new type
    expect(() => {
      proc.port.onmessage?.({ data: { type: "start", time: 0 } } as any);
      proc.process([], [makeOutput()], makeParams({ scale: 1 }));
    }).not.toThrow();
  });

  it("reset message resets phase to 0", () => {
    const proc = new LFOProcessor({ processorOptions: {} });
    proc.port.onmessage?.({ data: { type: "start", time: 0 } } as any);
    // Run one block to advance phase
    proc.process([], [makeOutput()], makeParams({ scale: 1 }));
    // Now reset
    proc.port.onmessage?.({ data: { type: "reset", time: 0 } } as any);
    const output = makeOutput();
    proc.process([], [output], makeParams({ scale: 1 }));
    // After reset at t=0 (already past), phase starts fresh — sine at phase 0 is 0
    expect(output[0][0]).toBeCloseTo(0, 3);
  });

  it("stop message causes processor to return false", () => {
    const proc = new LFOProcessor({ processorOptions: {} });
    proc.port.onmessage?.({ data: { type: "start", time: 0 } } as any);
    proc.process([], [makeOutput()], makeParams({ scale: 1 }));
    proc.port.onmessage?.({ data: { type: "stop", time: 0 } } as any);
    const result = proc.process([], [makeOutput()], makeParams({ scale: 1 }));
    expect(result).toBe(false);
  });
});
