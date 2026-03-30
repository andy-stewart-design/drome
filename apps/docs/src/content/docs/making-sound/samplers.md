---
title: "Samplers"
description: "Lorem ipsum dolor sit amet"
created: "Jul 08 2022"
updated: "Jul 08 2022"
order: 2
---

A sample player loads and plays audio files. Create one with `d.sample()`, passing one or more sample IDs.

```js
d.sample("bd").push(); // bass drum on every bar
d.sample("bd", "sd").push(); // bass drum and snare layered
```

## Sample IDs and banks

Sample IDs are short names for audio files. The default bank is `"tr909"` (a Roland TR-909 drum machine). You can select a specific sample within a bank by appending an index with a colon:

```js
d.sample("bd"); // first bass drum in tr909
d.sample("bd:0"); // same thing, explicit index
d.sample("bd:2"); // third bass drum variant
d.sample("sd", "hh", "bd"); // snare, hi-hat, and kick simultaneously
```

#### `.bank(name)`

Switch to a different sample bank.

```js
d.sample("bd").bank("tr808").push();
```

## Notes and start positions

For a sample player, note values set where in the sample playback begins. The value is a position from `0` to `1`, where `0` is the very start and `1` is the end.

```js
d.sample("bd")
  .note(0) // play from the beginning every bar
  .push();

d.sample("bd")
  .note([0, 0.5]) // play from start, then from halfway through
  .push();
```

`null` is a rest — no sample plays on that step:

```js
d.sample("bd")
  .note([0, null, 0, null]) // kick on beats 1 and 3
  .push();
```

## Playback

#### `.rate(n)`

Sets the playback speed. `1` is normal, `2` is double speed (an octave up), `0.5` is half speed (an octave down). A negative value plays the sample in reverse.

```js
.rate(2)    // double speed
.rate(-1)   // reverse
.rate(0.5)  // half speed
```

#### `.cut()`

Enables cut mode. When active, the sample's duration is determined by the note duration rather than the full sample length — so a note stops when the next note starts, rather than playing out fully. Useful for hi-hats and other sounds where you want tight control over length.

```js
d.sample("oh").note([0, null, 0, null]).cut().push();
```

#### `.fit(numBars)`

Stretches the sample to fill the given number of bars, automatically calculating the playback rate. The note pattern is also set to span that many bars. Useful for loops.

```js
d.sample("loop").fit(2).push(); // fit sample into 2 bars
```

#### `.begin(...positions)`

Sets the playback start position, as an alternative to `.note()`. Accepts the same cycle format.

```js
.begin(0, 0.25, 0.5, 0.75)  // step through 4 quarter-positions
```

#### `.chop(numChops, ...cycles)`

Slices the sample into `numChops` equal chunks and assigns each step a specific chunk. If no `cycles` are given, Drome automatically steps through the chunks in order.

```js
d.sample("loop")
  .chop(8) // divide into 8 slices, step through them
  .push();

d.sample("loop")
  .chop(4, [0, 2, 1, 3]) // 4 slices, play in custom order
  .push();
```

## Examples

A standard four-on-the-floor kick:

```js
d.sample("bd").note([0, null, 0, null, 0, null, 0, null]).push();
```

Kick and snare pattern:

```js
d.sample("bd").euclid(4, 16, 0).push();

d.sample("sd").euclid(2, 16, 4).push();
```

Hi-hat with varying start positions:

```js
d.sample("hh")
  .note([0, 0, 0, 0, 0, 0, 0, 0])
  .begin("0, 0, 0.1, 0, 0.2, 0, 0.05, 0")
  .cut()
  .gain(0.6)
  .push();
```

A chopped loop with reverb:

```js
d.sample("loop").chop(16).gain(0.7).fx(d.reverb(0.3)).push();
```

---

See [Instruments](./instruments) for all shared methods (gain, ADSR, filter, effects, patterns, etc.).
