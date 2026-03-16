---
title: "Pattern Methods"
description: "Methods for shaping and transforming patterns"
published: "Jul 08 2022"
updated: "Jul 08 2022"
heroImage: "../../../assets/blog-placeholder-3.jpg"
---

Beyond `.note()`, instruments have a set of methods for defining and transforming patterns. All of these are chainable.

## note

Sets the pattern directly. Each argument is a bar; within a bar, pass values or arrays of values.

```js
.note(1, null, 1, null)              // 4-step pattern
.note([1, null], [null, 1])          // 2 bars, 2 steps each
.note([1, 1], null, [1, 1, 1], null) // subdivisions within steps
```

## xox

Define a pattern using `x` for hits and spaces or any other character for rests. Useful for drum patterns.

```js
d.sample("bd").xox("x . . . x . . .").push();
d.sample("hh").xox("x x x x x x x x").push();
d.sample("sd").xox(". . x . . . x .").push();
```

You can also pass numbers — `1` for hit, `0` for rest:

```js
d.sample("bd").xox([1, 0, 0, 0], [1, 0, 1, 0]).push();
```

## euclid

Distributes a number of pulses evenly across a number of steps — a classic technique for generating polyrhythmic patterns.

```js
.euclid(pulses, steps, rotation)
```

```js
d.sample("bd").euclid(3, 8, 0).push(); // 3 hits in 8 steps
d.sample("hh").euclid(5, 8, 2).push(); // 5 hits in 8 steps, rotated by 2
```

The rotation shifts the pattern left by that many steps. Multiple values create multiple bars:

```js
d.sample("sd").euclid([2, 3], 8, 0).push(); // bar 1: 2 hits, bar 2: 3 hits
```

## hex

Express a pattern as a hexadecimal string or number. Each hex digit encodes 4 steps as a bitmask.

```js
d.sample("bd").hex("8888").push(); // "1000 1000 1000 1000" → kick on beats 1&3
d.sample("hh").hex("ffff").push(); // all 16 steps active
d.sample("sd").hex("0808").push(); // snare on beats 2&4
```

You can also pass numbers:

```js
d.sample("bd").hex(0x8080).push();
```

## sequence

Place specific pulses within a fixed number of steps.

```js
.sequence(steps, ...pulsePositions)
```

```js
d.sample("bd").sequence(8, 0, 4).push(); // 8 steps, hits at positions 0 and 4
d.sample("sd").sequence(8, [2, 6]).push(); // hits at positions 2 and 6
```

## arrange

Define a multi-bar pattern by specifying how many bars each sub-pattern repeats.

```js
.arrange([numBars, pattern], [numBars, pattern], ...)
```

```js
d.sample("bd")
  .arrange(
    [2, [1, null, null, null]], // play this for 2 bars
    [2, [1, null, 1, null]], // then this for 2 bars
  )
  .push();
```

## fast / slow

Speed up or slow down the pattern by a multiplier.

```js
d.sample("hh").note(1, 1, 1, 1).fast(2).push(); // plays twice as fast (8 hits per bar)
d.sample("bd").note(1, null, 1, null).slow(2).push(); // plays half as fast (spans 2 bars)
```

## stretch

Stretches the pattern across more steps, inserting silences between hits.

```js
d.sample("bd").note(1, null, 1, null).stretch(2).push();
// original: hit, rest, hit, rest
// stretched: hit, rest, rest, rest, hit, rest, rest, rest
```

## reverse

Reverses the pattern.

```js
d.synth("sine").root("C4").scale("major").note(0, 2, 4, 7).reverse().push();
// plays 7, 4, 2, 0
```

## legato

Sustains each note until the next one starts, instead of stopping at the end of its step.

```js
d.synth("sine").root("C4").note(0, null, 2, null).legato().push();
// the 0 sustains through the rest until the 2 plays
```

Pass `false` to turn legato off:

```js
.legato(false)
```
