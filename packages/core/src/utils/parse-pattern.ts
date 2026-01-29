import {
  isArray,
  isEnv,
  isLfoNode,
  isNumber,
  isObserver,
  isString,
} from "./validators";
import type { SNELO, Pattern, PatternInput } from "../types";

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

function parseParamInput(input: SNELO) {
  if (isEnv(input) || isLfoNode(input) || isObserver<"controlchange">(input)) {
    return input;
  } else if (isString(input) || isNumber(input)) {
    return parsePatternInput(input);
  } else {
    throw new Error("Invalid input:", input satisfies never);
  }
}

function isStepPattern(input: unknown): input is Pattern {
  return (
    isArray(input) &&
    input.reduce<boolean>((_, x) => {
      if (typeof x === "number") return true;
      else if (isArray(x)) return x.every((x) => typeof x === "number");
      return false;
    }, true)
  );
}

export { parseParamInput, parsePatternString, parsePatternInput };
