import Envelope from "@/automation/envelope";
// import LFO from "@/automation/lfo";
import { isEnv } from "./validators";
import type { Pattern, PatternInput } from "../types";

function parsePatternString(input: string) {
  const err = `[DROME] could not parse pattern string: ${input}`;
  try {
    const parsed = JSON.parse(`[${input}]`);
    if (!isStepPattern(parsed)) throw new Error(err);
    return parsed;
  } catch {
    console.warn(err);
    return [];
  }
}

function parsePatternInput(input: PatternInput): Pattern {
  if (typeof input === "string") return parsePatternString(input);
  return [input];
}

function parseParamInput(input: number | string | Envelope) {
  // if (input instanceof Envelope || input instanceof LFO) return input;
  if (isEnv(input)) return input;
  else return parsePatternInput(input);
}

function isStepPattern(input: unknown): input is Pattern {
  return (
    Array.isArray(input) &&
    input.reduce<boolean>((_, x) => {
      if (typeof x === "number") return true;
      else if (Array.isArray(x)) return x.every((x) => typeof x === "number");
      return false;
    }, true)
  );
}

export { parseParamInput, parsePatternString, parsePatternInput };
