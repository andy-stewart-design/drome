---
title: Effects
description: Audio effects in Drome
created: "Jul 08 2022"
updated: "Jul 08 2022"
---

Effects process an instrument's audio signal. You create effect objects using `d.*` methods, then attach them to instruments via `.fx()`.

```js
d.synth("saw")
  .root("C3")
  .note(0, 2, 4)
  .fx(d.reverb(0.3), d.delay(0.25, 0.4))
  .push();
```

Effects can be shared across multiple instruments — create the effect once and pass it to each:

```js
const verb = d.reverb(0.4);

d.sample("bd").note(1, null, null, null).fx(verb).push();
d.sample("sd").note(null, null, 1, null).fx(verb).push();
```

## reverb

Adds room ambience using convolution reverb.

**Algorithmic reverb (generated internally):**

```js
d.reverb(mix, decay, lpfStart, lpfEnd);
```

```js
d.reverb(0.3); // mix: 30%, default decay
d.reverb(0.5, 2); // mix: 50%, 2-second decay
d.reverb(0.4, 1.5, 2000, 500); // with low-pass filter sweep
```

- `mix` — wet/dry mix (0–1)
- `decay` — reverb tail length in seconds (default: 1)
- `lpfStart` — starting frequency for a low-pass filter on the IR (optional)
- `lpfEnd` — ending frequency for the LPF sweep (optional)

**IR from a sample bank:**

```js
d.reverb(mix, sampleName, bankName);
d.reverb(0.4, "hall", "impulses"); // use 'hall' from the 'impulses' bank
```

**IR from a URL:**

```js
d.reverb(0.4, "https://example.com/reverb.wav");
```

---

## delay

Adds a repeating echo.

```js
d.delay(delayTime, feedback);
```

```js
d.delay(0.25, 0.4); // quarter-second delay, 40% feedback
d.delay(0.5, 0.6); // half-second delay, 60% feedback
```

- `delayTime` — delay time in seconds (can be a pattern string for per-bar variation)
- `feedback` — how much of the delayed signal feeds back (0–1)

---

## filter / fil

A biquad filter. Can be used as a standalone effect on an instrument.

```js
d.filter(type, frequency, q);
d.fil(type, frequency, q); // short alias
```

```js
d.filter("lp", 800); // lowpass at 800 Hz
d.filter("hp", 300, 2); // highpass at 300 Hz, Q of 2
d.filter("bp", 1000, 3); // bandpass at 1 kHz
```

Filter types: `'lp'` / `'lowpass'`, `'hp'` / `'highpass'`, `'bp'` / `'bandpass'`

The frequency parameter accepts a number, a pattern string, an envelope, or an LFO.

---

## distort

Waveshaping distortion.

```js
d.distort(amount, postgain, type);
```

```js
d.distort(0.5); // moderate distortion
d.distort(0.9, 0.5); // heavy distortion, post-gain at 0.5
```

- `amount` — distortion intensity (0–1, can be an envelope or LFO)
- `postgain` — gain applied after distortion (default: 1)
- `type` — distortion algorithm (optional, uses default if omitted)

---

## crush

Bitcrusher — reduces bit depth and sample rate for a lo-fi effect.

```js
d.crush(bitDepth, rateReduction);
```

```js
d.crush(8); // 8-bit depth
d.crush(4, 2); // 4-bit depth, 2x rate reduction
```

- `bitDepth` — number of bits (1–16), can be an envelope or LFO
- `rateReduction` — downsampling factor (default: 1)

---

## gain

A simple gain stage. Useful for precise volume control in a signal chain.

```js
d.gain(amount);
d.gain(0.5); // reduce signal by half
```

- `amount` — gain multiplier (can be an envelope or LFO)

---

## pan

Stereo panning.

```js
d.pan(position);
d.pan(-1); // hard left
d.pan(0); // center
d.pan(1); // hard right
d.pan(0.5); // slightly right
```

- `position` — stereo position from -1 (left) to 1 (right), can be an envelope or LFO

## Chaining effects

Pass multiple effects to `.fx()` — they're applied in order:

```js
.fx(d.distort(0.6), d.filter('lp', 1000), d.reverb(0.2))
```
