import BaseCycle from "../base-cycle";
import FlatCycle from "../flat-cycle";
import NestedCycle from "../nested-cycle";
import RandomCycle from "../random-cycle";

export function isCycle(value: unknown): value is BaseCycle<any> {
  return value instanceof BaseCycle;
}

export function isFlatCycle(value: unknown): value is FlatCycle<any> {
  return value instanceof FlatCycle;
}

export function isNestedCycle(value: unknown): value is NestedCycle<any> {
  return value instanceof NestedCycle;
}

export function isRandomCycle(value: unknown): value is RandomCycle {
  return value instanceof RandomCycle;
}
