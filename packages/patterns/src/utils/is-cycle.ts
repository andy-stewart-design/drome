import BaseCycle from "../base-cycle";

export function isCycle(value: unknown): value is BaseCycle<any> {
  return value instanceof BaseCycle;
}
