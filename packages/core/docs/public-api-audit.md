# Public API Audit

A comprehensive reference of all public-facing methods across instruments, LFOs, envelopes, audio nodes, drome arrays, and effects.

---

## Instruments

### `Synth`

`src/instruments/synth.ts`

| Method | Parameters | Returns |
|--------|------------|---------|
| `voices` | `...input: (number \| number[])[]` | `this` |
| `panspread` | `input: Envelope \| LfoNode \| number \| number[], ...rest: (number \| number[])[]` | `this` |
| `freqspread` | `input: Envelope \| LfoNode \| number \| number[], ...rest: (number \| number[])[]` | `this` |
| `root` | `n: NoteName \| NoteValue \| number` | `this` |
| `scale` | `name: ScaleAlias` | `this` |
| `push` | — | `void` |
| `play` | `barStart: number, barDuration: number` | `void` |

Inherits all methods from `Instrument` — see [Instrument base methods](#instrument-base) below.

---

### `Sample`

`src/instruments/sample.ts`

| Method | Parameters | Returns |
|--------|------------|---------|
| `preloadSamples` | — | `Promise<AudioBuffer \| undefined>[]` |
| `bank` | `bank: string` | `this` |
| `begin` | `...input: (Nullable<number \| number[]> \| Nullable<number \| number[]>[])[]` | `this` |
| `chop` | `numChops: number, ...input: (number \| number[])` | `this` |
| `cut` | — | `this` |
| `fit` | `numBars?: number` (default `1`) | `this` |
| `rate` | `n: number` | `this` |
| `push` | — | `void` |
| `play` | `barStart: number, barDuration: number` | `void` |

Inherits all methods from `Instrument` — see [Instrument base methods](#instrument-base) below.

---

### `Stack`

`src/instruments/stack.ts`

| Method | Parameters | Returns |
|--------|------------|---------|
| `gain` | `input: number \| Envelope \| string` | `this` |
| `adsr` | `a: number, d?: number, s?: number, r?: number` | `this` |
| `att` | `v: number` | `this` |
| `dec` | `v: number` | `this` |
| `sus` | `v: number` | `this` |
| `rel` | `v: number` | `this` |
| `adsrMode` | `mode: AdsrMode` | `this` |
| `detune` | `input: SNELO` | `this` |
| `filter` | `type: FilterTypeAlias, f: SNELO, q?: SNELO` | `this` |
| `effects` | `...nodes: DromeAudioNode[]` | `this` |
| `push` | — | `void` |
| `destroy` | — | `void` |

**Aliases:** `dt()`, `env()`, `envMode()`, `fil()`, `fx()`

---

### Instrument Base

`src/instruments/instrument.ts` — inherited by `Synth` and `Sample`

| Method | Parameters | Returns |
|--------|------------|---------|
| `note` | `...input: (Nullable<number \| number[]> \| Nullable<number \| number[]>[])[]` | `this` |
| `arrange` | `...input: [number, Nullable<number \| number[]>[]][]` | `this` |
| `euclid` | `pulses: number \| number[], steps: number, rotation: number \| number[]` | `this` |
| `hex` | `...hexes: (string \| number)[]` | `this` |
| `reverse` | — | `this` |
| `sequence` | `steps: number, ...pulses: (number \| number[])[]` | `this` |
| `xox` | `...input: (number \| number)[]` | `this` |
| `fast` | `multiplier: number` | `this` |
| `slow` | `multiplier: number` | `this` |
| `stretch` | `bars: number, steps?: number` | `this` |
| `legato` | `v: boolean \| number \| number[]` (default `true`) | `this` |
| `gain` | `input: number \| Envelope \| string` | `this` |
| `adsr` | `a: number, d?: number, s?: number, r?: number` | `this` |
| `att` | `v: number` | `this` |
| `dec` | `v: number` | `this` |
| `sus` | `v: number` | `this` |
| `rel` | `v: number` | `this` |
| `adsrMode` | `mode: AdsrMode` | `this` |
| `detune` | `input: SNELO \| MIDIObserver<"controlchange">` | `this` |
| `filter` | `type: FilterTypeAlias, f: SNELO \| MIDIObserver<"controlchange">, q?: SNELO` | `this` |
| `mute` | `mute?: boolean` (default `false`) | `this` |
| `effects` | `...nodes: DromeAudioNode[]` | `this` |
| `midi` | `identifier: string, velocity?: number` | `this` |
| `midichannel` | `n: number \| number[]` | `this` |
| `stop` | `when?: number, fadeTime?: number` | `void` |
| `destroy` | — | `void` |

**Aliases:** `dt()`, `env()`, `envMode()`, `fil()`, `fx()`, `leg()`, `midichan()`, `rev()`, `seq()`

---

## LFOs

### `LFO`

`src/automation/lfo.ts`

| Method | Parameters | Returns |
|--------|------------|---------|
| `create` | — | `this` |
| `connect` | `destination: AudioParam` | `this` |
| `start` | `startTime?: number` | `this` |
| `speed` | `v: number` | `this` |
| `bpm` | `v: number` | `this` |
| `depth` | `v: number` | `this` |
| `type` | `v: OscillatorType` | `this` |
| `stop` | `when?: number` | `this` |
| `disconnect` | — | `this` |

**Getters:** `paused → boolean`, `value → number`

---

### `LfoNode`

`src/automation/lfo-node.ts`

| Method | Parameters | Returns |
|--------|------------|---------|
| `start` | `when?: number` (default `0`) | `this` |
| `stop` | `when?: number` (default `0`) | `this` |
| `bpm` | `bpm: number` | `this` |
| `rate` | `rate: number` | `this` |
| `normalize` | `normalize?: boolean` (default `true`) | `this` |
| `offset` | `phaseOffset: number` | `this` |
| `reset` | `when?: number` (default `0`) | `this` |
| `scale` | `scale: number` | `this` |
| `type` | `oscillatorType: BasicWaveformAlias` | `this` |

**Aliases:** `norm()`, `off()`

**Getters:** `waveform → BasicWaveform`, `started → boolean`, `normalized → boolean`, `currentRate → number`, `defaultValue → number`, `baseValue → number`

**Readonly params:** `bpmParam`, `bpbParam`, `rateParam`, `frequencyParam`, `scaleParam`, `phaseOffsetParam` (all `AudioParam`)

---

## Envelopes

### `Envelope`

`src/automation/envelope.ts`

| Method | Parameters | Returns |
|--------|------------|---------|
| `mode` | `mode: AdsrMode` | `this` |
| `adsr` | `a: number, d?: number, s?: number, r?: number` | `this` |
| `att` | `v: number` | `this` |
| `dec` | `v: number` | `this` |
| `sus` | `v: number` | `this` |
| `rel` | `v: number` | `this` |
| `maxValue` | `...v: (number \| number[])` | `this` |
| `apply` | `target: AudioParam, startTime: number, duration: number, cycleIndex: number, chordIndex: number` | `number` |

**Getters:** `startValue → number`, `endValue → number` (w/ setter), `defaultValue → number`, `a → number`, `d → number`, `s → number`, `r → number`

---

### `Pattern`

`src/automation/pattern.ts`

| Method | Parameters | Returns |
|--------|------------|---------|
| `note` | `...input: (number \| number[])` | `this` |
| `apply` | `target: AudioParam, chordIndex: number, noteIndex: number` | `void` |

---

## Drome Arrays

### `DromeArray<T>`

`src/array/drome-array.ts`

| Method | Parameters | Returns |
|--------|------------|---------|
| `note` | `...input: (T \| T[])` | `this` |
| `clear` | — | `void` |
| `fast` | `n: number` | `this` |
| `slow` | `n: number` | `this` |
| `stretch` | `bars: number, steps?: number` (default `1`) | `this` |
| `reverse` | — | `this` |
| `at` | `i: number` | `T[]` |
| `at` | `i: number, j: number` | `NonNullable<T>` |

**Getters:** `length → number`, `value → T[][]`, `rawValue → T[][]`

**Setters:** `defaultValue`, `value` (both `T[][]`)

---

### `DromeArrayNullable<T>`

`src/array/drome-array-nullable.ts` — extends `DromeArray`

| Method | Parameters | Returns |
|--------|------------|---------|
| `arrange` | `...input: [number, Nullable<T>[]][]` | `this` |
| `euclid` | `pulses: number \| number[], steps: number, rotation: number \| number[]` | `this` |
| `hex` | `...input: (string \| number)[]` | `this` |
| `sequence` | `steps: number, ...pulses: Pattern` | `this` |
| `xox` | `...input: Pattern \| string[]` | `this` |

---

## Audio Nodes

### `CompositeAudioNode` (abstract)

`src/audio-nodes/composite-audio-node.ts`

| Method | Parameters | Returns |
|--------|------------|---------|
| `connect` | `destination: AudioNode` | `void` |
| `disconnect` | — | `void` |
| `destroy` | — | `void` |
| `stop` | `when?: number` (default `0`) | `void` |
| `start` *(abstract)* | `when?: number, offset?: number` | `void` |
| `setFilterType` | `type: FilterType \| "none"` | `void` |
| `addEventListener` | `type: string, cb: EventListenerOrEventListenerObject` | `void` |
| `removeEventListener` | `type: string, cb: EventListenerOrEventListenerObject` | `void` |

**Getters:** `detune → AudioParam \| undefined`, `gain → AudioParam \| undefined`, `filterQ → AudioParam \| undefined`, `filterFrequency → AudioParam \| undefined`, `ctx → AudioContext`, `nodeType → string`, `filterType → string`, `connected → boolean`, `startTime → number`, `stopTime → number`

---

### `SynthNode`

`src/audio-nodes/composite-synth-node.ts` — extends `CompositeAudioNode`

| Method | Parameters | Returns |
|--------|------------|---------|
| `start` | `when?: number` (default `0`) | `void` |
| `setType` | `type: OscillatorType` | `void` |

**Getters:** `type → Waveform`, `panspread → AudioParam \| undefined`, `freqspread → AudioParam \| undefined`

**Setters:** `type` (`OscillatorType`)

---

### `SampleNode`

`src/audio-nodes/composite-sample-node.ts` — extends `CompositeAudioNode`

| Method | Parameters | Returns |
|--------|------------|---------|
| `start` | `when?: number` (default `0`), `offset?: number` (default `0`) | `void` |
| `setLoop` | `n: boolean` | `void` |
| `setLoopStart` | `n: number` | `void` |
| `setLoopEnd` | `n: number` | `void` |

**Getters:** `playbackRate → AudioParam`, `buffer → AudioBuffer \| null`, `duration → number`, `loop → boolean`, `loopStart → number`, `loopEnd → number`

**Setters:** `loop` (`boolean`), `loopStart` (`number`), `loopEnd` (`number`)

---

### `SupersawNode`

`src/audio-nodes/supersaw-worklet-node.ts`

| Method | Parameters | Returns |
|--------|------------|---------|
| `start` | `when?: number` (default `0`) | `void` |
| `stop` | `when?: number` (default `0`) | `void` |
| `voices` | `n: number` | `void` |

**Readonly params:** `frequency`, `detune`, `freqspread`, `panspread` (all `AudioParam`)

**Getters:** `startTime → number`, `stopTime → number`

---

## Effects

### `DromeAudioNode` (abstract)

`src/abstracts/drome-audio-node.ts`

| Method | Parameters | Returns |
|--------|------------|---------|
| `connect` | `dest: AudioNode` | `void` |
| `disconnect` | — | `void` |
| `destroy` | — | `void` |

**Getters:** `input → AudioNode`

---

### `AutomatableEffect` (abstract)

`src/abstracts/effect-automatable.ts` — extends `DromeAudioNode`

| Method | Parameters | Returns |
|--------|------------|---------|
| `apply` | `notes: Note<unknown>[], currentBar: number, startTime: number, duration: number` | `void` |
| `connect` | `dest: AudioNode` | `void` |
| `disconnect` | — | `void` |
| `destroy` | — | `void` |

**Getters:** `input → GainNode`

---

### `DromeFilter`

`src/effects/effect-filter.ts` — extends `AutomatableEffect`

| Method | Parameters | Returns |
|--------|------------|---------|
| `createEnvelope` | `max: number, adsr: number[]` | `void` |

**Getters:** `type → FilterType`

---

### `GainEffect`

`src/effects/effect-gain.ts` — extends `AutomatableEffect`

No additional public methods beyond parent.

---

### `DistortionEffect`

`src/effects/effect-distortion.ts` — extends `AutomatableEffect`

| Method | Parameters | Returns |
|--------|------------|---------|
| `distort` | `v: number` | `void` |
| `postgain` | `v: number` | `void` |

**Getters:** `distortionParam → AudioParam`, `postgainParam → AudioParam`

---

### `ReverbEffect`

`src/effects/effect-reverb.ts` — extends `AutomatableEffect`

| Method | Parameters | Returns |
|--------|------------|---------|
| `connect` | `dest: AudioNode` | `void` |

**Getters:** `buffer → AudioBuffer \| null`

---

### `DelayEffect`

`src/effects/effect-delay.ts` — extends `AutomatableEffect`

| Method | Parameters | Returns |
|--------|------------|---------|
| `connect` | `dest: AudioNode` | `void` |

---

### `PanEffect`

`src/effects/effect-pan.ts` — extends `AutomatableEffect`

No additional public methods beyond parent.

---

### `BitcrusherEffect`

`src/effects/effect-bitcrusher.ts` — extends `AutomatableEffect`

| Method | Parameters | Returns |
|--------|------------|---------|
| `bitDepth` | `v: number` | `void` |
| `rateReduction` | `v: number` | `void` |

**Getters:** `bitParam → AudioParam`, `rateParam → AudioParam`
