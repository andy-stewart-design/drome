---
title: "Working with Patterns"
description: "Sequencing sound in Drome"
created: "Jul 08 2022"
updated: "Mar 23 2026"
heroImage: "../../../assets/blog-placeholder-3.jpg"
---

Patterns are how you tell an instrument what to play and when. More precisely: a pattern is a sequence of steps that plays over one bar. This page covers how to express that sequencing logic in code.

Drome doesn't have a dedicated pattern language like Strudel or Tidal Cycles. Patterns are built using plain JavaScript arrays. Steps are spread evenly across a bar, and a set of helper methods lets you build more complex arrangements on top of that.

Whether a pattern language gets added down the road is an open question, but the goal from the start was to see how far plain JS could take us before reaching for a more heavy-handed approach. Admittedly, this design decision can create some verbosity for longer sequences — but the upside is that everything is explicit, composable, and easy to reason about.

## Arranging notes in time

The `.note()` method is the most direct way to see patterns in action. The array you pass in describes the sequence of steps across one bar — also known as a pattern — and the structure of that array tells Drome how to interpret them.

A single value plays once per bar as a one-step pattern. An array of values divides the bar into that many steps, each playing in sequence. Nest an array inside another array and you get a chord, with all of the notes sounding together as a single step:

```js
.note(60)                    // one step: one note
.note([60, 64, 67, 71])      // four steps: one note each
.note([[60, 64, 67, 71]])    // one step: one chord
.note([[60, 64], [67, 71]])  // two steps: two chords
```

Rests work in a similar way. A rest can be expressed as an explicit `null` or `undefined`, or by leaving the slot blank. All three are equivalent:

```js
.note([60, 64, null, 71])       // explicit null
.note([60, 64, undefined, 71])  // explicit undefined
.note([60, 64, , 71])           // implicit undefined
```

### String patterns

Patterns can be expressed as either an array of numbers or a string. In Drome, `[0, 3, 5]` and `"[0, 3, 5]"` are functionally equivalent. The string form is most useful when a method accepts multiple arguments, one of which can be a pattern. This allows the pattern definition to be self-contained and unambiguous.

```js
.euclid("[3, 5]", 8)   // two-pattern cycle: 3 hits across 8 steps, then 5 hits across 8 steps
```

## Patterns and cycles

You're not limited to a single pattern. Pass multiple arrays and Drome will play through each one in order — one per bar — before looping back to the first. This full repeating loop is called a **cycle**. A cycle is one bar long if you define one pattern, two bars long if you define two, and so on:

```js
// a two-pattern, two-bar cycle
d.synth("sine").note([60, null, 64, null], [60, null, 64, 67]).push();
```

## Steps set the resolution

The number of steps in your pattern sets the rhythmic resolution of that bar. There's no global grid — the bar simply divides itself by however many steps you define.

At 120 BPM, a bar is 2 seconds long. A four-step pattern gives you quarter notes (0.5s each). Eight steps gives you eighths (0.25s each). Sixteen gives you sixteenths (0.125s each), and so on:

```js
// 4 steps → quarter notes
d.synth("sine").note([60, 60, 60, 60]).push();

// 8 steps → eighth notes
d.synth("sine").note([60, 60, 60, 60, 60, 60, 60, 60]).push();

// 16 steps → sixteenth notes
d.synth("sine")
  .note(Array.from({ length: 16 }, () => 60))
  .push();
```

To be clear, the above examples are purely instructional — you will likely never want nor need to express an idea so verbosely. Instead, we can use pattern methods to construct more complex musical phrases, allowing us to balance expressiveness with concision.
