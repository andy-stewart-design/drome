---
title: Envelopes
description: Using ADSR envelopes to modulate parameters over time
created: "Jul 08 2022"
updated: "Jul 08 2022"
---

An envelope shapes how a parameter changes over the duration of a note. The classic ADSR (attack, decay, sustain, release) envelope is the main tool for making notes feel alive — giving them a sharp attack, a slower fade, whatever the sound calls for.

In Drome, envelopes are used in two ways:

1. **Directly on an instrument** via `.adsr()` — this controls the instrument's gain
2. **As a modulation source** via `d.env()` — passed into parameters like filter frequency, detune, or gain

## Instrument ADSR

The simplest way to shape the gain of an instrument:

```js
d.synth("saw")
  .root("C4")
  .note(0, 2, 4)
  .adsr(attack, decay, sustain, release)
  .push();
```

```js
.adsr(0.01, 0.1, 0.8, 0.2)   // short attack, some decay, long sustain, medium release
.adsr(0.5, 0, 1, 0)           // slow attack, instant sustain
.adsr(0, 0, 0, 0.5)           // instant on, slow fade out
```

Times (attack, decay, release) are in **seconds**. Sustain is a **ratio** from 0 to 1.

You can also use the short alias `.env()`:

```js
.env(0.01, 0.1, 0.8, 0.2)
```

Or set individual stages:

```js
.att(0.01)   // attack
.dec(0.1)    // decay
.sus(0.8)    // sustain level
.rel(0.2)    // release
```

## Standalone envelopes

`d.env()` creates an envelope object you can use to modulate other parameters — filter frequency, gain, distortion amount, etc.

```js
d.env(maxValue, startValue, endValue);
```

- `maxValue` — the peak the envelope reaches
- `startValue` — value at the start (and after release), defaults to 0
- `endValue` — value at the very end of the release, defaults to `startValue`

```js
const filterEnv = d.env(2000, 100); // sweeps from 100 Hz up to 2000 Hz

d.synth("saw").root("C3").note(0).fil("lp", filterEnv).push();
```

```js
const gainEnv = d.env(1, 0); // goes from 0 to 1

d.synth("tri").root("A3").note(0, 2, 4).gain(gainEnv).push();
```

### Setting ADSR on a standalone envelope

Call `.adsr()` on the envelope object itself:

```js
const filterEnv = d.env(3000, 200).adsr(0.02, 0.3, 0.2, 0.5);

d.synth("saw").root("C3").note(0).fil("lp", filterEnv).push();
```

Or use the individual stage methods:

```js
const env = d.env(1000, 50);
env.att(0.01);
env.dec(0.2);
env.sus(0.5);
env.rel(0.3);
```

## Envelope modes

The envelope mode controls how the ADSR fits within the note's duration.

```js
.adsrMode(mode)   // on an instrument
.envMode(mode)    // short alias
env.mode(mode)    // on an envelope object
```

| Mode     | Behavior                                                                          |
| -------- | --------------------------------------------------------------------------------- |
| `'fit'`  | The entire ADSR stretches to fill the note's duration (default)                   |
| `'clip'` | The ADSR plays at its natural timing; release may be cut off if the note is short |
| `'free'` | Like `'clip'` but the release is allowed to overlap with the next note            |

## Pattern-based max values

If you want the peak volume (or parameter value) of an envelope to change per-bar, pass a pattern to `maxValue`:

```js
const env = d.env(1, 0);
env.maxValue(0.3, 0.7, 1.0, 0.5); // different peak each bar
```
