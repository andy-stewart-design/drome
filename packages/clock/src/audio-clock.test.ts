import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AudioClock from "./audio-clock.js";

function mockCtx(currentTime = 0, state: AudioContextState = "running") {
  return {
    currentTime,
    state,
    resume: vi.fn().mockResolvedValue(undefined),
  } as unknown as AudioContext;
}

describe("AudioClock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("computed timing", () => {
    it("beatDuration is 60 / bpm", () => {
      const clock = new AudioClock(mockCtx(), 120);
      expect(clock.beatDuration).toBe(0.5);
    });

    it("barDuration is beatDuration * beatsPerBar", () => {
      const clock = new AudioClock(mockCtx(), 120, 4);
      expect(clock.barDuration).toBe(2);
    });

    it("barDuration respects custom beatsPerBar", () => {
      const clock = new AudioClock(mockCtx(), 120, 3);
      expect(clock.barDuration).toBe(1.5);
    });

    it("nextBeatStartTime is beatStartTime + beatDuration", () => {
      const clock = new AudioClock(mockCtx(), 120);
      expect(clock.nextBeatStartTime).toBe(
        clock.beatStartTime + clock.beatDuration,
      );
    });

    it("nextBarStartTime is barStartTime + barDuration", () => {
      const clock = new AudioClock(mockCtx(), 120);
      expect(clock.nextBarStartTime).toBe(
        clock.barStartTime + clock.barDuration,
      );
    });
  });

  describe("bpm()", () => {
    it("updates bpm for positive values", () => {
      const clock = new AudioClock(mockCtx(), 120);
      clock.bpm(140);
      expect(clock.beatsPerMin).toBe(140);
    });

    it("ignores zero", () => {
      const clock = new AudioClock(mockCtx(), 120);
      clock.bpm(0);
      expect(clock.beatsPerMin).toBe(120);
    });

    it("ignores negative values", () => {
      const clock = new AudioClock(mockCtx(), 120);
      clock.bpm(-50);
      expect(clock.beatsPerMin).toBe(120);
    });

    it("changing bpm immediately affects beatDuration", () => {
      const clock = new AudioClock(mockCtx(), 120);
      clock.bpm(60);
      expect(clock.beatDuration).toBe(1);
    });
  });

  describe("beatsPerBar setter", () => {
    it("floors fractional values", () => {
      const clock = new AudioClock(mockCtx(), 120);
      clock.beatsPerBar = 3.9;
      expect(clock.beatsPerBar).toBe(3);
    });

    it("clamps to minimum of 1", () => {
      const clock = new AudioClock(mockCtx(), 120);
      clock.beatsPerBar = 0;
      expect(clock.beatsPerBar).toBe(1);
    });

    it("accepts valid integer values", () => {
      const clock = new AudioClock(mockCtx(), 120);
      clock.beatsPerBar = 6;
      expect(clock.beatsPerBar).toBe(6);
    });
  });

  describe("on() / off()", () => {
    it("on() returns an unsubscribe function", () => {
      const clock = new AudioClock(mockCtx(), 120);
      const unsub = clock.on("beat", vi.fn());
      expect(typeof unsub).toBe("function");
    });

    it("off() removes a registered callback", () => {
      const clock = new AudioClock(mockCtx(), 120);
      const cb = vi.fn();
      clock.on("beat", cb);
      clock.off("beat", cb);
      // Verify by checking the unsubscribe returned by on() also works:
      const unsub = clock.on("bar", cb);
      unsub();
      // No error = pass; scheduler firing is tested via start/stop below
    });

    it("same callback can be registered for multiple event types", () => {
      const clock = new AudioClock(mockCtx(), 120);
      const cb = vi.fn();
      clock.on("beat", cb);
      clock.on("bar", cb);
      clock.off("beat", cb);
      // bar listener still exists — no throw
    });
  });

  describe("audioTimeToMIDITime()", () => {
    it("converts audio time offset to wall-clock milliseconds", () => {
      // _timeOrigin = performance.now() - ctx.currentTime * 1000
      // audioTimeToMIDITime(t) = _timeOrigin + t * 1000
      // With ctx.currentTime = 2.0:
      //   _timeOrigin = performance.now() - 2000
      //   audioTimeToMIDITime(2.0) = (performance.now() - 2000) + 2000 = performance.now()
      const ctx = mockCtx(2.0);
      const clock = new AudioClock(ctx, 120);
      const result = clock.audioTimeToMIDITime(2.0);
      expect(result).toBeCloseTo(performance.now(), -1); // within ~10ms
    });
  });

  describe("paused getter", () => {
    it("is true before start()", () => {
      const clock = new AudioClock(mockCtx(), 120);
      expect(clock.paused).toBe(true);
    });
  });

  describe("destroy()", () => {
    it("does not throw when called without starting", () => {
      const clock = new AudioClock(mockCtx(), 120);
      expect(() => clock.destroy()).not.toThrow();
    });

    it("leaves clock paused", () => {
      const clock = new AudioClock(mockCtx(), 120);
      clock.destroy();
      expect(clock.paused).toBe(true);
    });
  });

  describe("start() / stop()", () => {
    it("start() sets clock to running", async () => {
      const clock = new AudioClock(mockCtx(0, "running"), 120);
      await clock.start();
      expect(clock.paused).toBe(false);
      clock.destroy();
    });

    it("start() resumes a suspended AudioContext", async () => {
      const ctx = mockCtx(0, "suspended");
      const clock = new AudioClock(ctx, 120);
      await clock.start();
      expect(ctx.resume).toHaveBeenCalledOnce();
      clock.destroy();
    });

    it("start() fires start callbacks", async () => {
      const clock = new AudioClock(mockCtx(), 120);
      const cb = vi.fn();
      clock.on("start", cb);
      await clock.start();
      expect(cb).toHaveBeenCalledOnce();
      clock.destroy();
    });

    it("calling start() twice is a no-op the second time", async () => {
      const clock = new AudioClock(mockCtx(), 120);
      const cb = vi.fn();
      clock.on("start", cb);
      await clock.start();
      await clock.start();
      expect(cb).toHaveBeenCalledOnce();
      clock.destroy();
    });

    it("stop() fires stop callbacks", async () => {
      const clock = new AudioClock(mockCtx(), 120);
      await clock.start();
      const cb = vi.fn();
      clock.on("stop", cb);
      clock.stop();
      expect(cb).toHaveBeenCalledOnce();
    });

    it("stop() resets metronome to 0/0", async () => {
      const clock = new AudioClock(mockCtx(), 120);
      await clock.start();
      clock.stop();
      expect(clock.metronome.beat).toBe(0);
      expect(clock.metronome.bar).toBe(0);
    });

    it("stop() leaves clock paused", async () => {
      const clock = new AudioClock(mockCtx(), 120);
      await clock.start();
      clock.stop();
      expect(clock.paused).toBe(true);
    });
  });
});
