import LFO from "@/automation/lfo.js";
import Envelope from "@/automation/envelope.js";

function isNullish(v: unknown) {
  return v === null || v === undefined;
}

function isNumber(v: unknown) {
  return typeof v === "number";
}

function isLfoTuple(n: unknown[]): n is [LFO] {
  return n[0] instanceof LFO;
}

function isEnvTuple(n: unknown[]): n is [Envelope] {
  return n[0] instanceof Envelope;
}

function isStringTuple(n: unknown[]): n is [string] {
  return typeof n[0] === "string";
}

export { isNullish, isNumber, isEnvTuple, isLfoTuple, isStringTuple };
