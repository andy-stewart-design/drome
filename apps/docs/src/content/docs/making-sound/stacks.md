---
title: Stacks
description: Grouping multiple instruments together
created: "Jul 08 2022"
updated: "Jul 08 2022"
order: 3
---

A stack groups multiple instruments so you can configure them together. Any method you call on a stack is applied to all instruments inside it.

```js
const kick = d.sample("bd").note(1, null, null, null);
const snare = d.sample("sd").note(null, null, 1, null);

d.stack(kick, snare).gain(0.8).fx(d.reverb(0.1)).push();
```

## Creating a stack

```js
d.stack(...instruments);
```

Pass any number of `Synth` or `Sample` instances. Note that you don't call `.push()` on the individual instruments — only on the stack.

```js
const bass = d.synth("saw").root("C2").note(0, null, 0, null);
const lead = d.synth("sine").root("C4").note(0, 2, 4, 7);

d.stack(bass, lead).gain(0.5).push();
```

## What you can do with a stack

All shared instrument methods work on a stack and are forwarded to every instrument inside:

| Method                                 | Description                    |
| -------------------------------------- | ------------------------------ |
| `.gain(n)`                             | Set volume for all instruments |
| `.adsr(a, d, s, r)` / `.env()`         | Set ADSR envelope              |
| `.att()`, `.dec()`, `.sus()`, `.rel()` | Set individual ADSR stages     |
| `.filter()` / `.fil()`                 | Apply a filter                 |
| `.detune()` / `.dt()`                  | Detune all instruments         |
| `.effects()` / `.fx()`                 | Route through effects          |
| `.adsrMode()` / `.envMode()`           | Change envelope mode           |

## When to use a stack

Stacks are useful when you want a group of instruments to share processing. For example, running a whole drum kit through the same reverb:

```js
const bd = d.sample("bd").note(1, null, null, null);
const sd = d.sample("sd").note(null, null, 1, null);
const hh = d.sample("hh").note(1, 1, 1, 1);

d.stack(bd, sd, hh)
  .fx(d.reverb(0.15, "room", "fx"))
  .push();
```

Or applying a shared envelope shape to a layered synth sound:

```js
const osc1 = d.synth("saw").root("C3").note(0, 2, 4);
const osc2 = d.synth("sine").root("C3").note(0, 2, 4);

d.stack(osc1, osc2).env(0.02, 0.15, 0.6, 0.3).gain(0.4).push();
```

Note that pattern methods (`.note()`, `.xox()`, `.euclid()`, etc.) are **not** available on stacks — configure those on the individual instruments before passing them in.
