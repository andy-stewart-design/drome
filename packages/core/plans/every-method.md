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
- Get the active bar via `this.at(i)` — a single `S[]`
- Construct a temporary `new FlatCycle(currentPattern, this._nullValue)` — single-bar cycle
- Call `fn(temp)` — mutates temp, no bleed back to original
- Return `temp.at(0, j)` — query from bar 0 of the temp cycle

### Pattern case (`apply` is a `BaseCycle`)
- Return `apply.at(0, j)` — always starts from bar 0 of the alternate pattern

## Implementation

### `packages/patterns` — `BaseCycle`
- Add `_everyRules: Array<{ n: number, offset: number, apply: Function | BaseCycle }>`
- Add `every()` method — pushes rule onto `_everyRules`, returns `this` (chainable)
- Override `at(i, j?)` to check rules before normal lookup — **first match wins**
- No `clone()` needed

### `packages/core` — `Drome` class (`index.ts`)
- Add `d.note(...input)` factory — returns `new NestedCycle(input, null)`
- Add `d.param(...input)` factory — returns `new FlatCycle(input, 0)`
- Follows same pattern as existing `d.rand()`

### `packages/core` — `Instrument` class
- Add `instrument.every()` delegating method — forwards to `_cycles.every()`, returns `this`

### `packages/core` — `Synth` class
- Update `synth.note()` to detect when a `NestedCycle` is passed — swap it in as `_cycles` wholesale (new `else if` branch)

### `packages/core` — `Sample` class
- Update `sample.begin()` to detect when a `NestedCycle` is passed — swap it in as `_cycles` wholesale (same pattern as `synth.note()`)

## Decisions Log

- **Naming:** `every` preferred over `firstOf`/`lastOf` — more flexible, cleaner API
- **Default offset:** `n - 1` (last of), override with explicit offset arg
- **Multiple rules:** Allowed — stack via chaining, first match wins on conflict
- **Callback scope:** Callback receives a single-bar `FlatCycle` constructed from `this.at(i)`, not a full clone — sufficient for transforms like `rev()`, rules out multi-bar operations like `stretch()`
- **No `clone()` needed:** Scoping to the active bar eliminates the need for a full cycle clone; `FlatCycle` constructor handles wrapping `S[]` to `[[...]]` correctly
- **Alternate pattern query index:** Always `0` — drum break mental model, always starts fresh
- **Scope:** `FlatCycle` and `NestedCycle` only for now; `RandomCycle` deferred
