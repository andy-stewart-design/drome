import { beforeAll, describe, expect, it } from "vitest";
import { workletIds } from "../constants";

let DistortionProcessor: any;

beforeAll(async () => {
  await import("./worklet-distortion");
  DistortionProcessor = (globalThis as any).__processors[workletIds.distortion];
});

function makeParams(distortion: number, postgain: number) {
  return {
    distortion: new Float32Array([distortion]),
    postgain: new Float32Array([postgain]),
  };
}

function makeIO(samples: number[]) {
  const inChan = new Float32Array(samples);
  const outChan = new Float32Array(samples.length);
  const inputs = [[inChan]];
  const outputs = [[outChan]];
  return { inputs, outputs, outChan };
}

describe("DistortionProcessor", () => {
  it("registers under the expected processor id", () => {
    expect(DistortionProcessor).toBeDefined();
  });

  it("defaults to sigmoid algorithm", () => {
    // With very low distortion, sigmoid is near-identity
    const proc = new DistortionProcessor({ processorOptions: {} });
    const { inputs, outputs, outChan } = makeIO([0.5]);
    proc.process(inputs, outputs, makeParams(0, 1));
    // distortion=0 → shape=expm1(0)=0, sigmoid(x,0) = x
    expect(outChan[0]).toBeCloseTo(0.5, 4);
  });

  it("accepts a custom algorithm via processorOptions", () => {
    const proc = new DistortionProcessor({ processorOptions: { algorithm: "hardClip" } });
    const { inputs, outputs, outChan } = makeIO([10]);
    proc.process(inputs, outputs, makeParams(0, 1));
    // hardClip with shape=0 clamps to [-1,1]
    expect(outChan[0]).toBeLessThanOrEqual(1);
  });

  it("postgain=0 results in near-silence (clamped to 0.001 minimum)", () => {
    const proc = new DistortionProcessor({ processorOptions: {} });
    const { inputs, outputs, outChan } = makeIO([0.5]);
    proc.process(inputs, outputs, makeParams(0, 0));
    // postgain is clamped to 0.001, so output is very small
    expect(Math.abs(outChan[0])).toBeLessThan(0.002);
  });

  it("higher distortion increases output magnitude", () => {
    const proc = new DistortionProcessor({ processorOptions: {} });
    const { inputs: inputs1, outputs: outputs1, outChan: out1 } = makeIO([0.3]);
    const { inputs: inputs2, outputs: outputs2, outChan: out2 } = makeIO([0.3]);
    proc.process(inputs1, outputs1, makeParams(0, 1));
    proc.process(inputs2, outputs2, makeParams(5, 1));
    expect(Math.abs(out2[0])).toBeGreaterThan(Math.abs(out1[0]));
  });

  it("does not write to output for zero-valued samples", () => {
    const proc = new DistortionProcessor({ processorOptions: {} });
    const { inputs, outputs, outChan } = makeIO([0, 0]);
    proc.process(inputs, outputs, makeParams(1, 1));
    expect(outChan[0]).toBe(0);
    expect(outChan[1]).toBe(0);
  });

  it("returns true to keep processor alive", () => {
    const proc = new DistortionProcessor({ processorOptions: {} });
    const { inputs, outputs } = makeIO([0.5]);
    expect(proc.process(inputs, outputs, makeParams(0, 1))).toBe(true);
  });
});
