---
title: MIDI
description: Sending and receiving MIDI in Drome
created: "Jul 08 2022"
updated: "Jul 08 2022"
---

Drome supports MIDI in both directions: you can send notes from instruments to external hardware or software, and you can receive CC (control change) values from knobs and sliders to modulate parameters in real time.

> [!NOTE]
> MIDI requires the browser's Web MIDI API, which prompts for permission on first use.

## Setup

MIDI access must be initialized before you can use any MIDI features. This is done through the editor or your host application — the `Drome` instance will have a `midiController` attached once access has been granted.

## MIDI output

Use `.midi()` on any instrument to route its notes to a MIDI output device. The instrument continues to play audio internally and also sends MIDI note on/off messages.

```js
.midi(deviceName)
```

```js
d.synth("sine")
  .root("C4")
  .scale("minor")
  .note(0, 2, 4, 7)
  .midi("My Synth")
  .push();
```

The `deviceName` is matched against available MIDI output ports. It's a partial, case-insensitive match, so `'Synth'` will match a device named `'My Synth 1'`.

### MIDI channel

After calling `.midi()`, you can specify a MIDI channel with `.midichan()` (or its alias `.midichan()`):

```js
.midi('Bassline').midichan(2)    // send on channel 2
```

Pass an array to rotate through channels per step:

```js
.midichan([1, 2, 3, 4])    // cycles through channels 1–4
```

## MIDI input

`d.midicc()` creates an observer that tracks a MIDI CC value from a connected controller. The returned value can be used anywhere a number, envelope, or LFO would be accepted.

```js
d.midicc(nameOrControlNumber, defaultValue);
```

- `nameOrControlNumber` — the MIDI device name or CC number as a string (e.g. `'Knob 1'`, `'CC 74'`)
- `defaultValue` — the value to use before any MIDI input is received (default: 0)

```js
const filterCC = d.midicc("CC 74", 800); // CC 74, default 800 Hz

d.synth("saw").root("C3").note(0, 2, 4).fil("lp", filterCC).push();
```

Now turning the knob mapped to CC 74 on your controller will sweep the filter cutoff in real time.

### Using CC for gain

```js
const volumeCC = d.midicc("Knob 1", 0.5);

d.synth("sine").root("A3").note(0).gain(volumeCC).push();
```

### Using CC for detune

```js
const detuneCC = d.midicc("Mod Wheel", 0);

d.synth("saw").root("C4").note(0, 2, 4).detune(detuneCC).push();
```

## Inspecting available devices

If you're not sure what your devices are named, you can log available inputs and outputs:

```js
d.on("bar", () => {
  d.log(
    d.midiController?.inputs.map((i) => i.name).join(", ") ?? "No MIDI inputs",
  );
});
```

See the [Logging](../working-with-the-editor/logging) page for more on how `d.on` and `d.log` work.
