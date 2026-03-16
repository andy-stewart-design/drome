---
title: "Working with Patterns"
description: "Sequencing sound in Drome"
published: "Jul 08 2022"
updated: "Jul 08 2022"
heroImage: "../../../assets/blog-placeholder-3.jpg"
---

Patterns are how you tell an instrument what to play and when. More concretely: a pattern describes the sequence of notes or sounds across one **bar** of time. This page covers how that sequencing works in code.

At present, Drome doesn't have a dedicated pattern language like Strudel or Tidal Cycles — patterns are instead built with plain JavaScript arrays. Steps are spread evenly across a bar, and a set of helper methods lets you build more complex arrangements on top of that.

Whether a pattern language gets added down the road is an open question, but the goal from the start was to see how far plain JS could take us before reaching for a more heavy-handed approach. Addmitedly, this design decision can create some verbosity for longer sequences — but the upside is that everything is explicit, composable, and easy to reason about.

## Arranging notes in time

The `.note()` method on a synthesizer is the most direct way to see patterns in action. The array you pass in describes the sequence of pitches to play across one bar, and the structure of that array tells Drome how to interpret them.

A single value plays once per bar. An array of values divides the bar into that many steps, each playing in sequence. Nest an array inside another array and you get a chord, with all of the notes sounding together as a single step:

```js
.note(60)                    // one bar, one note
.note([60, 64, 67, 71])      // one bar, four notes
.note([[60, 64, 67, 71]])    // one bar, one chord
.note([[60, 64], [67, 71]])  // one bar, two chords
```

Rest notes work in a similar way. Rests can be defined using explicit `null` or `undefined` values, or just leave the slot blank. All three are equivalent; the implicit form, however, is the most concise:

```js
.note([60, 64, null, 71])       // explicit null
.note([60, 64, undefined, 71])  // explicit undefined
.note([60, 64, , 71])           // implicit undefined
```

For samples, the `.offset()` method functions similarly. Instead of defining the frequency of a note, though, it sets the starting point within a sample. This is especially useful for loops and (sample chopping)["./making-sound/samples"]. For one-shots like kicks and snares, you will likely more often reach for Drome’s pattern methods.

```js
d.sample("my_loop").offset([0.25, 0, 0.625, 0.5]).push();
```

## More bars, more variety

You’re not limited to a single bar. Pass multiple arrays to create multiple bars in sequence. Drome will play through all of the bars you have defined in order before looping back to the first one:

```js
d.synth("sine").note([60, null, 64, null], [60, null, 64, 67]).push();
```

## Your code sets the resolution

The number of values in your array sets the rhythmic resolution of a bar. There's no global grid — the bar simply divides itself by however many steps you define.

At 120 BPM, for example, a bar is 2 seconds. Four steps gives you quarter notes (0.5s each). Eight gives you eighths (0.25s each). Sixteen gives you sixteenths (0.125s each), and so on:

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
