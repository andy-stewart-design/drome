import { beforeAll, describe, expect, it } from "vitest";
import { workletIds } from "../constants";

let BitcrushProcessor: any;

beforeAll(async () => {
  await import("./worklet-bitcrusher");
  BitcrushProcessor = (globalThis as any).__processors[workletIds.bitcrusher];
});

function makeParams(rateReduction: number, bitDepth: number) {
  return {
    rateReduction: new Float32Array([rateReduction]),
    bitDepth: new Float32Array([bitDepth]),
  };
}

function makeIO(samples: number[]) {
  const inChan = new Float32Array(samples);
  const outChan = new Float32Array(samples.length);
  const inputs = [[inChan]];
  const outputs = [[outChan]];
  return { inputs, outputs, outChan };
}

describe("BitcrushProcessor", () => {
  it("registers under the expected processor id", () => {
    expect(BitcrushProcessor).toBeDefined();
  });

  it("exposes rateReduction and bitDepth parameter descriptors", () => {
    const names = BitcrushProcessor.parameterDescriptors.map((p: any) => p.name);
    expect(names).toContain("rateReduction");
    expect(names).toContain("bitDepth");
  });

  it("with rateReduction=1 updates lastSample every sample", () => {
    const proc = new BitcrushProcessor();
    const { inputs, outputs, outChan } = makeIO([0.1, 0.5, 0.9]);
    const params = makeParams(1, 16);
    proc.process(inputs, outputs, params);
    // With 16-bit depth the quantization is very fine — output should closely track input
    for (let i = 0; i < outChan.length; i++) {
      expect(Math.abs(outChan[i] - inputs[0][0][i])).toBeLessThan(0.01);
    }
  });

  it("with rateReduction=4 holds the captured sample across the next 3 frames", () => {
    const proc = new BitcrushProcessor();
    // Phase increments each sample; capture fires when phase reaches rateReduction.
    // With rate=4: capture fires at i=3, then holds for i=4,5,6 until next capture at i=7.
    const input = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
    const { inputs, outputs, outChan } = makeIO(input);
    const params = makeParams(4, 16);
    proc.process(inputs, outputs, params);
    // Capture at i=3 (sample 0.4) → held at i=3,4,5,6
    expect(outChan[3]).toBeCloseTo(outChan[4], 5);
    expect(outChan[4]).toBeCloseTo(outChan[5], 5);
    expect(outChan[5]).toBeCloseTo(outChan[6], 5);
    // New capture at i=7 (sample 0.8) → different value
    expect(outChan[7]).not.toBeCloseTo(outChan[3], 2);
  });

  it("bitDepth=1 quantizes to two levels (±step)", () => {
    const proc = new BitcrushProcessor();
    const { inputs, outputs, outChan } = makeIO([0.6, -0.6]);
    const params = makeParams(1, 1);
    proc.process(inputs, outputs, params);
    const step = Math.pow(0.5, 1); // 0.5
    for (const s of outChan) {
      // Each output should be a multiple of the step
      const remainder = Math.abs((s / step) % 1);
      expect(Math.min(remainder, 1 - remainder)).toBeLessThan(1e-6);
    }
  });

  it("returns true to keep processor alive when input is present", () => {
    const proc = new BitcrushProcessor();
    const { inputs, outputs } = makeIO([0.5]);
    expect(proc.process(inputs, outputs, makeParams(1, 8))).toBe(true);
  });
});
