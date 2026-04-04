# Plan: RandomCycle

> Source PRD: https://github.com/andy-stewart-design/drome/issues/25

## Architectural decisions

Durable decisions that apply across all phases:

- **Package boundary**: `RandomCycle` class and PRNG utilities live in `@drome/patterns`. The `d.rand()` factory and instrument integration live in `@drome/core`.
- **Inheritance**: `BaseCycle<T>` abstract base class is shared by `FlatCycle`, `NestedCycle`, and `RandomCycle`. Base class owns `_cycle`, `_nullValue`, `applyPattern()`, all modifier methods, `clear()`, `current` getter, and declares abstract `at()`.
- **RandomCycle's `_cycle`**: Stores a binary mask (numbers), not actual values. `1` = "generate a random value here", `0` = "insert nullValue". Pattern modifiers operate on this mask eagerly, same as sibling classes.
- **`at()` contract**: All cycle types handle their own index wrapping internally. Callers pass raw indices (e.g., `metronome.bar`) without pre-computing modulo.
- **PRNG**: Xorshift via `xorwise()`, `getSeed()`, `seedToRand()`. PERIOD = 300, SEED_MAX = 2^29. Seed derivation: `getSeed(userSeed + localIndex)`.
- **No metronome dependency**: RandomCycle is a pure data structure. Loop wrapping is derived from the index passed to `at()`.
- **No instance sharing**: A RandomCycle instance should not be shared across multiple parameters. Same seed produces same sequence, so users create separate instances.

---

## Phase 1: Base class extraction

**User stories**: None directly — prerequisite refactor

### What to build

Extract the shared logic from `FlatCycle` and `NestedCycle` into an abstract `BaseCycle<T>` class. Both existing classes extend it. No new behavior is introduced — this is a pure refactor.

The base class owns:
- `_cycle` and `_nullValue` properties
- `applyPattern()` method
- All modifier methods: `euclid`, `hex`, `fast`, `slow`, `stretch`, `reverse`, `sequence`, `xox`
- `clear()` method
- `current` getter
- Abstract `at()` declaration

FlatCycle and NestedCycle retain their setter methods (`pattern()`, `arrange()`, `replace()`) and their `at()` implementations. The `length` getter stays on the subclasses for now.

### Acceptance criteria

- [ ] `BaseCycle<T>` abstract class exists with shared logic
- [ ] `FlatCycle<T>` extends `BaseCycle<T>` and passes all existing tests unchanged
- [ ] `NestedCycle<T>` extends `BaseCycle<T>` and passes all existing tests unchanged
- [ ] No public API changes — existing imports and usage patterns work identically

---

## Phase 2: PRNG utilities + minimal RandomCycle

**User stories**: 1, 3, 4

### What to build

Lift the PRNG functions (`xorwise`, `getSeed`, `seedToRand`, `floatMapper`) into `@drome/patterns` as a utility module. Build a minimal `RandomCycle` that extends `BaseCycle<number>`, accepts an optional seed, and returns a single deterministic random float (0-1) per bar via `at(i)`.

At this stage: no loop support, no range/int/bin, no steps. Just `new RandomCycle()` and `new RandomCycle({ seed: 100 })` with a working `at(i)` that generates one value per bar based on the binary mask (`[[1]]`).

### Acceptance criteria

- [ ] PRNG utilities exist in `@drome/patterns` with tests for determinism and value range
- [ ] `RandomCycle` extends `BaseCycle<number>`
- [ ] `at(i)` returns a single-element array with a float in [0, 1]
- [ ] Same seed + same index = same output across calls and runs
- [ ] Different indices produce different values
- [ ] `RandomCycle` is exported from `@drome/patterns`

---

## Phase 3: Range, mappers, and steps

**User stories**: 2, 7, 12, 13

### What to build

Add the RandomCycle-specific chainable methods: `.range(min, max)`, `.int()`, `.bin()`, and `.steps(n)`.

- `.range()` stores min/max and applies linear interpolation during generation
- `.int()` switches to floor-based integer mapping
- `.bin()` switches to binary (round) mapping, ignoring range
- `.steps(n)` sets `_cycle` to `[[1, 1, ..., 1]]` (n ones), producing n random values per bar

### Acceptance criteria

- [ ] `.range(200, 800)` produces values within [200, 800]
- [ ] `.int()` produces integer values
- [ ] `.int().range(60, 72)` produces integers in [60, 72)
- [ ] `.bin()` produces only 0 or 1
- [ ] `.steps(8)` produces an 8-element array
- [ ] `.steps(n).range(a, b)` produces n values all within range
- [ ] All methods are chainable and can be combined in any order

---

## Phase 4: Pattern modifier composition

**User stories**: 8, 9, 10

### What to build

Verify and test that inherited pattern modifiers work correctly on RandomCycle's binary mask. Since modifiers are inherited from BaseCycle and operate on `_cycle`, they should work out of the box — but this phase explicitly tests the composition behavior.

Key interactions to verify:
- `.steps(3).euclid(3, 8)` → 8-step array with 3 random values and 5 null values
- `.steps(4).hex(0xa)` → hex mask applied to 4 random values
- `.steps(4).reverse()` → reversed mask positions, same random value order
- `.steps(8).fast(2)` → compressed mask
- `.steps(4).slow(2)` → expanded mask with null interpolation

The null value must be set for pattern modifiers to work (they insert nullValue at 0-positions). RandomCycle should default `_nullValue` to `0` at construction so modifiers work without external setup.

### Acceptance criteria

- [ ] `.steps(3).euclid(3, 8)` produces an 8-element array with exactly 3 non-null values
- [ ] `.hex()` correctly masks random values
- [ ] `.reverse()` changes value positions but not the random sequence
- [ ] `.fast()` and `.slow()` transform the mask correctly
- [ ] `.sequence()` and `.xox()` work as masks on random values
- [ ] Modifier stacking (multiple modifiers chained) produces correct results

---

## Phase 5: Loop support

**User stories**: 5, 6

### What to build

Add loop support to RandomCycle. When a loop length is specified, `at(i)` wraps the local index so the random sequence repeats. Support both single loop length and alternating loop lengths.

- Single loop: `localIndex = i % loopLength`
- Alternating loops (e.g., `[2, 4]`): total period = sum of lengths (6). Derive segment and local offset from `i % totalPeriod` by walking cumulative lengths.
- No loop (default): `localIndex = i`, sequence grows indefinitely

### Acceptance criteria

- [ ] `new RandomCycle({ seed: 1, loop: 4 })`: `at(0)` equals `at(4)`, `at(1)` equals `at(5)`, etc.
- [ ] `new RandomCycle({ seed: 1, loop: [2, 4] })`: sequence repeats after 6 bars with correct segment boundaries
- [ ] No-loop mode: `at(0)` through `at(299)` all produce unique values (within PERIOD)
- [ ] Loop interacts correctly with steps and modifiers

---

## Phase 6: Instrument integration

**User stories**: 11, 14, 15

### What to build

Wire RandomCycle into `@drome/core`. This phase touches the instrument layer and the Drome class.

**`at()` contract change**: Update the instrument's `beforePlay` to pass `metronome.bar` directly to `at()` instead of pre-computing `bar % cycle.length`. All three cycle types handle wrapping internally. This is a one-line change but affects all instruments.

**Type system**: Add `RandomCycle` to the `SNELO` and `Automation` type unions. Add `instanceof RandomCycle` branches in parameter application methods (gain, detune, filter frequency/q, panspread, freqspread).

**Null value auto-setting**: When a consuming method receives a RandomCycle, it sets the null value based on context — `note()` sets null, `gain()` sets 0, etc. Add a `.null()` method on RandomCycle to allow manual override.

**Factory**: Add `d.rand(seed?, loop?)` to the Drome class, returning a new `RandomCycle` instance.

### Acceptance criteria

- [ ] `beforePlay` passes raw `metronome.bar` to `at()` — no manual modulo
- [ ] Existing FlatCycle and NestedCycle behavior is unchanged after the `at()` contract change
- [ ] `d.rand()` returns a `RandomCycle` instance
- [ ] `d.rand(seed)` and `d.rand(seed, loop)` pass through correctly
- [ ] RandomCycle is accepted by `gain()`, `note()`, `detune()`, `filter()` and other parameter methods
- [ ] `gain(d.rand())` auto-sets null value to 0
- [ ] `note(d.rand())` auto-sets null value to null
- [ ] `.null(value)` overrides the auto-set null value
- [ ] End-to-end: `d.sample("hh").hex(0xff).gain(d.rand()).push()` produces audible output with varying gain
