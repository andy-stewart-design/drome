# Refactor Decisions

Decisions and open questions surfaced during architectural review of `docs/plan.md`.

---

## Revised Objectives

The original four objectives have been re-scoped:

1. **Modularization** — Extract packages incrementally (see Migration Strategy below)
2. **Schema-Based Architecture** — Core architectural change; details below
3. **Automated Documentation** — Scoped to a manual agent skill (see Docs below)
4. ~~Distribution via AT Proto~~ — **Deferred.** Data persistence (IndexDB + AT Proto) is a follow-on scope once the schema architecture is stable. A serializable schema directly enables this future work without coupling to it.

---

## Schema

### Note / ScheduledValue shape

- `notes: Note[]` → **`ScheduledNote[][]`** (outer dimension = cycles, inner = steps)
- The same multi-cycle problem applies to `AutomationDescriptor { kind: "pattern" }` — its `values` field needs the same `[][]` treatment
- **`startOffset` and `duration`** are **0–1 fractional bar floats**, not seconds. The audio engine converts to wall-clock time using the live BPM from the clock. This keeps schemas valid across tempo changes without regeneration.
- Two types may be warranted:
  - **`ScheduledValue`** — `{ value, startOffset }` — for automation (gain steps, detune, etc.)
  - **`ScheduledNote`** — `{ value, startOffset, duration }` — for pitched notes where legato requires knowing when a note ends
  - This split is an open question; can be resolved when `language` is being built

### Instrument identity

- `id: string` added as a **required field** on `InstrumentSchema`
- Generated positionally at schema-build time: `instrument-01`, `instrument-02`, etc.
- Positional IDs do not enable true diffing (reordering instruments changes all IDs downstream), but they reserve the field for future use without a breaking schema change
- Full rebuild-on-eval is retained for now; diffing is an optimization deferred until IDs are stable

### Gain

- **`baseGain` removed from schema** — it's an audio engine internal (a per-instrument-type level multiplier to prevent clipping). The audio engine owns it, not the contract.
- `gain.base` (0–1, user-facing per-instrument level) remains

### Filter

- **Instrument-level `filter` field likely removed** — there was no confirmed technical reason for it to live outside the effects chain. Keeping filter only in `EffectDescriptor` avoids the "which filter do I use?" confusion and aligns with the minimalism goal.
- Revisit only if a pre-chain audio reason surfaces

### Parameter automation taxonomy

**Needs an audit before the audio engine is built against the schema.** Every effect parameter should be classified as one of:

| Tier                  | Type                                                        | Example            |
| --------------------- | ----------------------------------------------------------- | ------------------ |
| **Static**            | Plain `number` or `string` — set once, never automated      | `reverb.decay`     |
| **Patternable**       | `ScheduledValue[][]` — steps through values per cycle/step  | `delay.delayTime`  |
| **Fully automatable** | `AutomationDescriptor` — pattern, envelope, LFO, or MIDI CC | `filter.frequency` |

Current inconsistencies in `schema.ts` (e.g. `delay.delayTime: number[]`, `reverb.decay: number`) should be resolved during this audit, not left to accumulate.

---

## Orchestrator / Data Flow

The `core` package is not eliminated — it becomes a **thin orchestrator** (composition root) that holds instances of `clock`, `language`, and `audio-engine` and coordinates the flow between them.

### Three-phase evaluation loop

```
eval() {
  this.schema = language.evaluate(code)
}

beforeBar() {
  // ~100ms before bar boundary — freeze window
  audioEngine.implement(this.schema)
}

onBar() {
  audioEngine.play()
}
```

- `eval()` is cheap — pure data transform, no audio work, can run any time
- `beforeBar()` freezes the schema and builds audio nodes
- `onBar()` begins playback of the newly built nodes

### Multiple evaluations between bar boundaries

- Each `eval()` **overwrites** `this.schema` wholesale — only the most recent evaluation is implemented
- If the user evaluates **during** the `beforeBar()` freeze window, the new schema is written to a **pending slot** and promoted at the next `beforeBar()`. Work is never discarded.
- The orchestrator needs two schema slots: **current** (being implemented) and **pending** (waiting for next bar)

### BPM

- BPM lives in the `clock` package
- The `language` package exposes a method to update the current BPM
- Schemas store timing as 0–1 fractional bar floats — BPM is applied by the audio engine at scheduling time, not baked into the schema

---

## Migration Strategy

### Extract-first candidates (low dependency, incremental)

These packages change minimally and can be extracted and adopted without waiting for the schema work:

[x] **`clock`** — self-contained timing engine, no schema dependency
[x] **`midi`** — observable wrapper around Web MIDI API, no schema dependency
[x] **`audio-worklets`** — already separate files, no runtime coupling

### Coordinated tranche (migrate together)

These are tightly coupled to the schema change and must be built and swapped as a unit:

- **`language`** — fluent API → schema generation
- **`audio-engine`** — schema → Web Audio nodes
- **`core` orchestrator** — wires clock + language + audio-engine together

You cannot extract `language` without `audio-engine` ready to consume the schema, and neither can be tested meaningfully without the orchestrator.

### `patterns` package

Open question. `DromeArray` and pattern manipulation logic could be:

- A **standalone `patterns` package** that `language` depends on (useful if the REPL or other consumers need pattern manipulation independently)
- **Internalized into `language`** (simpler if it's never used outside of schema generation)

Decide when scoping the `language` package.

---

## MIDI Note Input

Planned API:

```js
d.synth().note(d.midi()).push(); // unquantized, play freely
d.synth().note(d.midi(16)).push(); // quantized to 16th notes
d.synth().note(d.midi(null)).push(); // explicit: play freely
```

- `d.midi(n)` is a drop-in replacement for a pattern argument
- An instrument using `d.midi()` receives all notes from an external MIDI source — it does not have an internal pattern
- Quantization snaps to the clock; the argument is the subdivision (e.g. `16` = 16th notes)
- **Deferred** — does not block the schema refactor. The schema already has a `midi` field reserved for trigger input.

---

## Documentation Automation

- Scoped to a **manual agent skill**: invoke the skill, describe what changed, receive a draft doc section in the established MDX format
- The agent works from schema types + source implementation to generate parameter tables and initial prose
- Human editing pass is expected — the goal is eliminating the blank-page problem, not full automation

---

## Testing

- **Test runner: Vitest** — natural fit for ESM-first TypeScript monorepo
- Approach: **test-driven development** — each chunk of work begins with identifying what tests to write, then implementation, then running tests
- The `language` package is the highest-value testing target: schema generation is pure functions, fully testable without Web Audio
- The `audio-engine` will require mocking `AudioContext` at the boundary
- Testing infrastructure (vitest config) needs to be established **before** TDD can start — this is the first task of the refactor

---

## Build Tooling

- Current: `tsdown 0.17.0-beta.4`
- **Rolldown** is a reasonable alternative (more established, backs Vite 6 internally)
- **Decision: non-blocking.** Swap build tool per-package independently as packages are extracted. Don't let this block the refactor.
- **Vite Plus** (monorepo management, currently alpha): deferred. Too early to adopt on top of an already-ambitious refactor.
