# Plan: `every()` Method

## Overview

Add an `every(n, fnOrPattern)` / `every(n, offset, fnOrPattern)` method to `BaseCycle` that conditionally applies a transformation or swaps in an alternate pattern on a given cycle interval.

## Signature

```typescript
cycle.every(4, fn)           // triggers on i % 4 === 3 (last of — default)
cycle.every(4, 0, fn)        // triggers on i % 4 === 0 (first of)
cycle.every(4, 2, fn)        // triggers on i % 4 === 2 (3rd of every 4)
cycle.every(4, otherCycle)   // swap in alternate pattern on last of 4
```

- `n` — how many cycles in the period
- `offset` — which cycle within the period triggers (default: `n - 1`)
- `fnOrPattern` — either a callback or a `BaseCycle` instance

## Behavior

### Callback case (`apply` is a function)
- Clone `this` into a fresh instance
- Call `fn(clone)` — mutates clone, no bleed back to original
- Return `clone.at(i, j)` — same global bar index, transformed data

### Pattern case (`apply` is a `BaseCycle`)
- Return `apply.at(0, j)` — always starts from bar 0 of the alternate pattern

## Implementation

### `BaseCycle`
- Add `_everyRules: Array<{ n: number, offset: number, apply: Function | BaseCycle }>`
- Add `every()` method — pushes rule onto `_everyRules`, returns `this` (chainable)
- Override `at(i, j?)` to check rules before normal lookup — **first match wins**
- Add abstract `clone()` method

### `FlatCycle` / `NestedCycle`
- Implement `clone()` — deep copy `_cycle` (2D array) and `_nullValue`

### `RandomCycle`
- Stub `clone()` — throws, not supported for now

## Decisions Log

- **Naming:** `every` preferred over `firstOf`/`lastOf` — more flexible, cleaner API
- **Default offset:** `n - 1` (last of), override with explicit offset arg
- **Multiple rules:** Allowed — stack via chaining, first match wins on conflict
- **Clone behavior:** No mutation of original — callback receives and mutates a throwaway clone
- **Alternate pattern query index:** Always `0` — drum break mental model, always starts fresh
- **Scope:** `FlatCycle` and `NestedCycle` only for now; `RandomCycle` deferred
