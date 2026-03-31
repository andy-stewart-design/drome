import Envelope from "@/automation/envelope";
import LfoNode from "@/automation/lfo-node";
function isNullish(v: unknown) {
  return v === null || v === undefined;
}

function isString(input: unknown): input is string {
  return typeof input === "string";
}

function isNumber(v: unknown) {
  return typeof v === "number";
}

function isArray(v: unknown) {
  return Array.isArray(v);
}

function isEnv(n: unknown): n is Envelope {
  return n instanceof Envelope;
}

function isLfoNode(n: unknown): n is LfoNode {
  return n instanceof LfoNode;
}

export { isNullish, isNumber, isArray, isEnv, isLfoNode, isString };
