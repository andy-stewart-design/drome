import { describe, expect, it, vi } from "vitest";
import MIDIObserver from "./midi-observer";
import type { MIDIControlMessage, MIDINoteMessage } from "./types";

const mockInput = {} as unknown as MIDIInput;

function makeControlMsg(value: number): MIDIControlMessage {
  return { type: "controlchange", input: mockInput, channel: 1, controlNumber: 7, value };
}

function makeNoteMsg(note = 60, velocity = 100): MIDINoteMessage {
  return { type: "noteon", input: mockInput, channel: 1, note, velocity };
}

describe("MIDIObserver", () => {
  describe("channel()", () => {
    it("sets a single channel", () => {
      const obs = new MIDIObserver("controlchange", "test");
      obs.channel(3);
      expect(obs.channels).toEqual([3]);
    });

    it("sets multiple channels from array", () => {
      const obs = new MIDIObserver("controlchange", "test");
      obs.channel([1, 2, 3]);
      expect(obs.channels).toEqual([1, 2, 3]);
    });

    it("replaces previously set channels", () => {
      const obs = new MIDIObserver("controlchange", "test");
      obs.channel([1, 2]);
      obs.channel(5);
      expect(obs.channels).toEqual([5]);
    });
  });

  describe("value()", () => {
    it("returns the default value (0) when not set", () => {
      const obs = new MIDIObserver("controlchange", "test");
      expect(obs.currentValue).toBe(0);
    });

    it("sets the current value", () => {
      const obs = new MIDIObserver("controlchange", "test", 64);
      expect(obs.currentValue).toBe(64);
    });

    it("updates current value via value(n)", () => {
      const obs = new MIDIObserver("controlchange", "test");
      obs.value(42);
      expect(obs.currentValue).toBe(42);
    });
  });

  describe("isType()", () => {
    it("returns true for matching type", () => {
      const obs = new MIDIObserver("controlchange", "test");
      expect(obs.isType("controlchange")).toBe(true);
    });

    it("returns false for non-matching type", () => {
      const obs = new MIDIObserver("controlchange", "test");
      expect(obs.isType("note")).toBe(false);
    });
  });

  describe("update() — controlchange without range", () => {
    it("calls onUpdate with the raw data", () => {
      const obs = new MIDIObserver("controlchange", "test");
      const cb = vi.fn();
      obs.onUpdate(cb);
      const msg = makeControlMsg(100);
      obs.update(msg);
      expect(cb).toHaveBeenCalledWith(msg);
    });

    it("stores the raw value as currentValue", () => {
      const obs = new MIDIObserver("controlchange", "test");
      obs.onUpdate(() => {});
      obs.update(makeControlMsg(64));
      expect(obs.currentValue).toBe(64);
    });
  });

  describe("update() — controlchange with range()", () => {
    it("maps MIDI 0 to range min", () => {
      const obs = new MIDIObserver("controlchange", "test").range(0, 200);
      const cb = vi.fn();
      obs.onUpdate(cb);
      obs.update(makeControlMsg(0));
      expect(cb.mock.calls[0][0].value).toBeCloseTo(0);
    });

    it("maps MIDI 127 to range max", () => {
      const obs = new MIDIObserver("controlchange", "test").range(0, 200);
      const cb = vi.fn();
      obs.onUpdate(cb);
      obs.update(makeControlMsg(127));
      expect(cb.mock.calls[0][0].value).toBeCloseTo(200);
    });

    it("maps MIDI midpoint to range midpoint", () => {
      const obs = new MIDIObserver("controlchange", "test").range(-100, 100);
      const cb = vi.fn();
      obs.onUpdate(cb);
      obs.update(makeControlMsg(64));
      expect(cb.mock.calls[0][0].value).toBeCloseTo(0.79, 1);
    });

    it("stores the mapped value as currentValue", () => {
      const obs = new MIDIObserver("controlchange", "test").range(0, 1);
      obs.onUpdate(() => {});
      obs.update(makeControlMsg(127));
      expect(obs.currentValue).toBeCloseTo(1);
    });
  });

  describe("update() — non-controlchange type", () => {
    it("calls onUpdate with the raw note message without mapping", () => {
      const obs = new MIDIObserver("note", "test");
      const cb = vi.fn();
      obs.onUpdate(cb);
      const msg = makeNoteMsg();
      obs.update(msg as any);
      expect(cb).toHaveBeenCalledWith(msg);
    });
  });

  describe("destroy()", () => {
    it("clears channels and resets state", () => {
      const obs = new MIDIObserver("controlchange", "test");
      obs.channel([1, 2, 3]);
      obs.destroy();
      expect(obs.channels).toHaveLength(0);
      expect(obs.currentValue).toBe(0);
    });
  });
});
