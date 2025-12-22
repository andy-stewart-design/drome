import LFO from "@/automation/lfo";
// import Envelope from "@/automation/envelope";
import Envelope from "@/automation/envelope";

function isNullish(v: unknown) {
  return v === null || v === undefined;
}

function isNumber(v: unknown) {
  return typeof v === "number";
}

function isLfoTuple(n: unknown[]): n is [LFO] {
  return n[0] instanceof LFO;
}

// function isEnvTuple(n: unknown[]): n is [Envelope | Envelope2] {
//   return n[0] instanceof Envelope || n[0] instanceof Envelope2;
// }

function isEnvTuple(n: unknown[]): n is [Envelope] {
  return n[0] instanceof Envelope;
}

function isString(input: unknown): input is string {
  return typeof input === "string";
}

function isStringTuple(n: unknown[]): n is [string] {
  return typeof n[0] === "string";
}

export { isNullish, isNumber, isEnvTuple, isLfoTuple, isString, isStringTuple };
