# Error Handling Audit

## The Existing Event System

`Drome` has two types of user-facing events today:

- **Clock events** (`"start"`, `"stop"`, `"beat"`, `"bar"`, etc.) — bar-synchronized, stored in `Map<type, Set<fn>>`
- **Log events** — a `Set<LogCallback>` in `SessionManager`, bypasses the clock queue

There is **no error event**. Everything goes to `console.warn`/`console.error` or is silently swallowed.

---

## Recommended: `"error"` event on `Drome`

Modeled on the existing `"log"` event pattern — immediate (not bar-synchronized), emitted via `drome.on("error", fn)`:

```typescript
type DromeErrorCategory =
  | "worklet" // worklet load or instantiation failure
  | "sample" // sample fetch/decode failure
  | "midi" // MIDI access, port, or observer failure
  | "pattern" // pattern string parse failure
  | "audio" // AudioContext/AudioNode errors
  | "unknown";

interface DromeError {
  category: DromeErrorCategory;
  message: string;
  cause?: unknown; // original Error or DOMException
}
```

Usage:

```typescript
drome.on("error", (err) => console.error(err.category, err.message, err.cause));
```

---

## Priority Errors to Wire Up

### Critical — Silently Swallowed

User has no idea anything broke.

**1. Worklet load failure — `core/src/index.ts:57`**
Catches and `console.warn`s only. If worklets fail to load, `SupersawNode`, `LfoNode`, `BitcrusherEffect`, and `DistortionEffect` are all silently broken.
Category: `"worklet"`

**2. MIDI init failure — `core/src/managers/session-manager.ts:165`**
`NotSupportedError` and permission denied are caught and `console.warn`-only. All subsequent `drome.midicc()` and `inst.midi()` calls silently no-op.
Category: `"midi"`

**3. Sample load failures — `core/src/utils/load-sample.ts:3` and `:21`**
Both failure paths (`console.error`, return `null`) never reach user code. The sample silently plays nothing.
Category: `"sample"`

**4. Pattern string parse failure — `core/src/utils/parse-pattern.ts:17`**
Returns `[]` silently. An invalid pattern string like `"[abc"` causes complete silence with no feedback.
Category: `"pattern"`

**5. Reverb render failure — `core/src/effects/effect-reverb.ts:67`**
`renderFilter().then(...)` has no `.catch()`. An `OfflineAudioContext` failure becomes an unhandled promise rejection and reverb silently produces a dry signal.
Category: `"audio"`

---

### High — Unguarded Paths That Can Throw and Crash the Scheduler

**6. `new AudioContext()` unguarded — `core/src/index.ts:47`**
Browser can throw `NotSupportedError` or `SecurityError`. No try/catch.
Category: `"audio"`

**7. `new AudioWorkletNode()` on every tick — `core/src/audio-nodes/supersaw-worklet-node.ts:22`**
Throws `InvalidStateError` if worklets didn't load. Called from `Synth.play()` on every bar tick — can crash the scheduler loop.
Category: `"worklet"`

**8. `async` inside `forEach` in `Sample.play()` — `core/src/instruments/sample.ts:102`**
`async` callback inside `.forEach()` is fire-and-forget. Any rejection from `loadSample` becomes an unhandled promise rejection.
Category: `"sample"`

**9. `navigator.permissions.query` unguarded — `core/src/managers/session-manager.ts:155`**
The Permissions API doesn't exist in Firefox. This throws and rejects the entire `Drome.init()` call.
Category: `"midi"`

---

### Medium — Console Only

Visible in devtools but not surfaced to library users.

| #   | File                                       | Line(s)       | Description                                                                                   | Category    |
| --- | ------------------------------------------ | ------------- | --------------------------------------------------------------------------------------------- | ----------- |
| 10  | `core/src/instruments/instrument.ts`       | 145, 185, 357 | Invalid filter/detune type — `console.warn` only, effect silently not applied                 | `"audio"`   |
| 11  | `core/src/instruments/instrument.ts`       | 387, 393      | MIDI device not found / MIDI not enabled — `console.warn` only, MIDI routing silently skipped | `"midi"`    |
| 12  | `core/src/abstracts/effect-automatable.ts` | 44            | Invalid automation input — `console.warn` only                                                | `"pattern"` |
| 13  | `core/src/managers/sample-manager.ts`      | 50, 57        | Sample bank/name not found — `console.warn` only                                              | `"sample"`  |
| 14  | `midi/src/midi-observer.ts`                | 33            | Observer misconfigured (no port id/name) — `console.error` only                               | `"midi"`    |
| 15  | `midi/src/utils.ts`                        | 15            | No MIDI port matching name/id — `console.warn` only                                           | `"midi"`    |

---

### Low — Silent Functional Failures and Bugs

| #   | File                                  | Line | Description                                                                                                                       | Category    |
| --- | ------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| 16  | `core/src/instruments/synth.ts`       | 105  | Invalid note string falls back to MIDI 0 (8 Hz) silently via `\|\| 0`                                                             | `"audio"`   |
| 17  | `core/src/utils/midi-to-frequency.ts` | 5    | Out-of-range MIDI note returns 0 — oscillator plays at 0 Hz                                                                       | `"audio"`   |
| 18  | `core/src/index.ts`                   | 201  | `midicc()` returns `0` when MIDI unavailable, causing `.gain(0)` silently                                                         | `"midi"`    |
| 19  | `core/src/utils/parse-pattern.ts`     | 34   | `new Error("Invalid input:", input)` is a JS bug — `Error` takes one string; the input value is silently dropped from the message | `"pattern"` |
| 20  | `core/src/utils/flip-buffer.ts`       | 18   | `reversed = original` mutates a local variable, not the buffer array — `rate(-1)` samples always produce silence                  | `"sample"`  |

---

## Implementation Plan

1. Add `DromeError` type and `DromeErrorCategory` to `core/src/types.ts`
2. Add `error: Set<DromeErrorCallback>` to `ListenerMap` in `session-manager.ts`
3. Add `"error"` branch to `Drome.on()` in `core/src/index.ts`
4. Add `Drome.emitError(category, message, cause?)` private method
5. Thread `emitError` into all sites above, replacing or supplementing existing `console.warn`/`console.error` calls
6. Fix the functional bug in `flip-buffer.ts` (item 20) — not an error surfacing issue, but a silent data corruption bug
