import LFO from "@/automation/lfo.js";
import Envelope from "@/automation/envelope.js";
import Envelope2 from "@/automation/envelope-2.js";

function isNullish(v: unknown) {
  return v === null || v === undefined;
}

function isNumber(v: unknown) {
  return typeof v === "number";
}

function isLfoTuple(n: unknown[]): n is [LFO] {
  return n[0] instanceof LFO;
}

function isEnvTuple(n: unknown[]): n is [Envelope | Envelope2] {
  return n[0] instanceof Envelope || n[0] instanceof Envelope2;
}

function isStringTuple(n: unknown[]): n is [string] {
  return typeof n[0] === "string";
}

export { isNullish, isNumber, isEnvTuple, isLfoTuple, isStringTuple };
