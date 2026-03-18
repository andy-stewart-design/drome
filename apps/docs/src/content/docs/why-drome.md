---
title: Why Drome?
description: How Drome differs from other browser-based live coding tools
created: "Mar 11 2026"
updated: "Mar 11 2026"
order: 1
---

There are other live coding tools for the web — [Strudel](https://strudel.cc/) in particular is excellent and worth checking out. If you've used one of these other tools, Drome will feel familiar in some ways and deliberately different in others. The features it prioritizes and the tradeoffs it makes are worth understanding before you decide if it's the right fit for your work.

## Timing and Quantization

In Drome, your code changes audibly take effect at the **start of the next bar** (similar to Session Mode in Ableton Live). When you evaluate your code, Drome processes the changes immediately. It loads new samples and preemptively completes other setup work, but it waits until the next bar before applying your changes.

This means the music never hits out of step with the beat — which matters a lot in a live performance context.

## Simple API

As a language, Drome focuses on pattern, precedence, and simplicity. Drome’s API is designed to be familiar and readable at a glance, and to maintain an approachable scope and surface area.

Instruments are created with one call, configured with chained methods, and registered with `.push()`. There's no mini-language to learn, no operator precedence to remember.

```js
d.synth("saw")
  .note([[60, 64, 67]])
  .gain(d.env(0, 0.5).adsr(0.9, 0.1, 0.1, 0.1))
  .fx(d.reverb(0.3))
  .push();
```

That's a sawtooth synthesizer playing a C major chord, with a gain envelope and reverb applied. Everything is a regular method call.

## Modular audio chain

Effects in Drome are first-class objects. You create them separately and pass them into instruments via the `effects()` (or `.fx()`) method.
This come with two main benefits.

First, the audio chain for a given instrument is constructed just in time and its order will reflect the order of the effects in your code. The allows for flexibility in the way the audio for an instrument is processed and how multiple effects interact.

```js
// lowpass filter affects only the sawtooth wave
d.synth("saw").note(60).fx(d.filter("lp", 800), d.crush(4)).push();

// lowpass filter affects both the sawtooth wave and the bitcrush effect
d.synth("saw").note(60).fx(d.crush(4), d.filter("lp", 800)).push();
```

Second, this allows you to share an effect across multiple instruments, reuse it, and inspect it independently.

```js
const verb = d.reverb(0.4);
const dly = d.delay(0.25, 0.5);

d.synth("saw").note(60).adsr(0.01, 0.5, 0.1, 0.1).fx(verb, dly).push();
d.sample("hh").fx(verb, dly).push();
```

## Just JavaScript™

Drome doesn't redefine JavaScript syntax or override how the language behaves. We don't modify global prototypes or silently augment your code during evalutaion code — your code runs as-is in a function scope. You can use variables, conditionals, loops, `Math`, and anything else available in a browser environment.

```js
const notes = [60, 62, 64, 65, 67];
const shuffled = notes.sort(() => Math.random() - 0.5);

d.synth("tri")
  .note(...shuffled)
  .push();
```

It's JavaScript all the way down (for better or for worse).
