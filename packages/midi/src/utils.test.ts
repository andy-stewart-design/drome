import { describe, expect, it } from "vitest";
import { encodeNoteCommand, isArray, isNumber, parseMIDIMessage } from "./utils";

const mockInput = {} as unknown as MIDIInput;

describe("encodeNoteCommand", () => {
  it("note-on sets high nibble to 9", () => {
    const [cmd] = encodeNoteCommand("on", 1, 60, 100);
    expect(cmd >> 4).toBe(9);
  });

  it("note-off sets high nibble to 8", () => {
    const [cmd] = encodeNoteCommand("off", 1, 60, 0);
    expect(cmd >> 4).toBe(8);
  });

  it("encodes channel 1 as low nibble 0", () => {
    const [cmd] = encodeNoteCommand("on", 1, 60, 100);
    expect(cmd & 0x0f).toBe(0);
  });

  it("encodes channel 16 as low nibble 15", () => {
    const [cmd] = encodeNoteCommand("on", 16, 60, 100);
    expect(cmd & 0x0f).toBe(15);
  });

  it("clamps channel above 16 to 16", () => {
    const [cmd] = encodeNoteCommand("on", 99, 60, 100);
    expect(cmd & 0x0f).toBe(15);
  });

  it("clamps note below 0 to 0", () => {
    const [, note] = encodeNoteCommand("on", 1, -5, 100);
    expect(note).toBe(0);
  });

  it("clamps note above 127 to 127", () => {
    const [, note] = encodeNoteCommand("on", 1, 200, 100);
    expect(note).toBe(127);
  });

  it("clamps velocity above 127 to 127 for note-on", () => {
    const [, , vel] = encodeNoteCommand("on", 1, 60, 200);
    expect(vel).toBe(127);
  });

  it("forces velocity to 0 for note-off regardless of input", () => {
    const [, , vel] = encodeNoteCommand("off", 1, 60, 100);
    expect(vel).toBe(0);
  });
});

describe("parseMIDIMessage", () => {
  it("parses note-on", () => {
    const msg = parseMIDIMessage(new Uint8Array([0x90, 60, 100]), mockInput);
    expect(msg).toMatchObject({ type: "noteon", channel: 1, note: 60, velocity: 100 });
  });

  it("treats note-on with velocity 0 as note-off", () => {
    const msg = parseMIDIMessage(new Uint8Array([0x90, 60, 0]), mockInput);
    expect(msg).toMatchObject({ type: "noteoff", channel: 1, note: 60, velocity: 0 });
  });

  it("parses note-off", () => {
    const msg = parseMIDIMessage(new Uint8Array([0x80, 60, 0]), mockInput);
    expect(msg).toMatchObject({ type: "noteoff", channel: 1, note: 60, velocity: 0 });
  });

  it("parses control change", () => {
    const msg = parseMIDIMessage(new Uint8Array([0xb1, 7, 64]), mockInput);
    expect(msg).toMatchObject({ type: "controlchange", channel: 2, controlNumber: 7, value: 64 });
  });

  it("parses program change", () => {
    const msg = parseMIDIMessage(new Uint8Array([0xc0, 5, 0]), mockInput);
    expect(msg).toMatchObject({ type: "programchange", channel: 1, program: 5 });
  });

  it("returns null for unknown status byte", () => {
    const msg = parseMIDIMessage(new Uint8Array([0xf0, 0, 0]), mockInput);
    expect(msg).toBeNull();
  });

  it("includes the input reference in the result", () => {
    const msg = parseMIDIMessage(new Uint8Array([0x90, 60, 100]), mockInput);
    expect(msg).toHaveProperty("input", mockInput);
  });

  it("parses channel from high-channel status byte", () => {
    const msg = parseMIDIMessage(new Uint8Array([0x9f, 60, 100]), mockInput); // channel 16
    expect(msg).toMatchObject({ channel: 16 });
  });
});

describe("isArray", () => {
  it("returns true for arrays", () => expect(isArray([])).toBe(true));
  it("returns false for non-arrays", () => expect(isArray({})).toBe(false));
});

describe("isNumber", () => {
  it("returns true for numbers", () => expect(isNumber(42)).toBe(true));
  it("returns false for strings", () => expect(isNumber("1")).toBe(false));
  it("returns false for null", () => expect(isNumber(null)).toBe(false));
});
