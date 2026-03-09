# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About This Package

`@drome/core` is the Web Audio synthesis engine for Drome, a web-based live music coding language inspired by TidalCycles. It implements synthesis, sampling, effects, automation, MIDI, and pattern sequencing natively using the Web Audio API.

This is one package in a monorepo at the repo root (`../../`). The workspace uses `@repo/typescript-config` as a shared TypeScript config.

## Commands

```bash
pnpm run build          # Bundle with tsdown → dist/index.mjs + index.d.mts
pnpm run dev            # Watch mode
pnpm run check-types    # TypeScript type checking (no emit)
pnpm run format         # Prettier format src/
```

There is no test runner configured. Type checking is the primary validation.

## Architecture

### Entry Point & Public API

`src/index.ts` — the `Drome` class is the top-level orchestrator and the only public API consumers interact with. Key methods:

- `Drome.init(bpm?)` — async factory; creates AudioContext, initializes `SessionManager` and `SampleManager`
- Instrument factories: `drome.synth()`, `drome.sample()`, `drome.stack()`
- Effect factories: `drome.filter()`, `drome.reverb()`, `drome.delay()`, `drome.distort()`, `drome.crush()`, `drome.gain()`, `drome.pan()`
- Automation factories: `drome.env()`, `drome.lfo()`, `drome.midicc()`
- Lifecycle: `drome.start()`, `drome.stop()`, `drome.bpm()`, `drome.evaluate(code)`
- Events: `drome.on('beat' | 'bar' | 'prebar' | 'start' | 'stop' | 'pause' | 'log', cb)`

### State & Evaluation

`src/managers/session-manager.ts` — central state hub. Manages:

- A **queue system** that batches mutations during a code evaluation cycle (safe hot-reload semantics)
- MIDI controller registry
- Clock lifecycle

`src/clock/audio-clock.ts` — BPM-based timing engine. Fires beat/bar events and schedules audio precisely via Web Audio API time.

### Instruments

`src/instruments/instrument.ts` — large abstract base class (~14KB) shared by `Synth` and `Sample`. Contains all pattern scheduling, effect routing, and automation logic.

`src/instruments/synth.ts` and `src/instruments/sample.ts` — concrete instrument implementations.

`src/instruments/stack.ts` — groups multiple instruments to play together.

### Audio Nodes & Worklets

`src/audio-nodes/` — composite Web Audio node wrappers for instruments.

`src/worklets/` — `AudioWorkletProcessor` implementations (raw TS files embedded as strings at build time via a custom tsdown plugin in `tsdown.config.ts`). These run in the audio rendering thread. The `raw-import.d.ts` type declaration supports `?raw` imports for this.

### Effects

`src/effects/` — one file per effect. Each extends a base automatable class from `src/abstracts/effect-automatable.ts`.

### Automation

`src/automation/` — `Envelope` (ADSR), `LfoNode`, and `Pattern` (step sequencer). These modulate instrument/effect parameters over time.

### Pattern System

`src/array/drome-array.ts` — `DromeArray`: a 2D array wrapper that cycles through values per beat/bar tick, enabling TidalCycles-style pattern notation.

### MIDI

`src/midi/` — MIDI input handling. `MIDIController` (`midi/index.ts`) manages Web MIDI API connections. `MIDIObserver` handles CC and note listeners.

### Path Aliases

`@/*` maps to `src/*` (configured in both `tsconfig.json` and `tsdown.config.ts`).
