# Synth

A synthesizer generates sound from oscillators. Create one with `d.synth()`, passing one or more waveform names.

```js
d.synth("sine").note(60).push();
```

Every method returns the synth, so you can chain everything before `.push()`.

## Waveforms

The first arguments to `d.synth()` set the oscillator type. You can pass multiple waveforms — each one produces a separate oscillator that plays simultaneously, all blended together.

```js
d.synth("sine"); // single sine oscillator
d.synth("saw", "sine"); // saw + sine layered together
d.synth("supersaw"); // detuned stack of multiple saws
```

Available waveforms:

| Alias                           | Waveform                              |
| ------------------------------- | ------------------------------------- |
| `"sine"`, `"sin"`               | Sine wave — smooth, pure tone         |
| `"sawtooth"`, `"saw"`           | Sawtooth — bright, full of harmonics  |
| `"square"`, `"sq"`              | Square wave — hollow, buzzy           |
| `"triangle"`, `"tri"`           | Triangle — soft, flute-like           |
| `"supersaw"`, `"ssaw"`, `"sup"` | Detuned stack of sawtooth oscillators |

## Notes

Synth notes are MIDI note numbers. MIDI 60 is middle C (C4), and each step up or down is one semitone.

```js
d.synth("sine")
  .note(60, 62, 64, 65) // C, D, E, F in MIDI numbers
  .push();
```

Common reference points:

- `48` = C3
- `60` = C4 (middle C)
- `72` = C5

You can play chords by putting multiple notes in an array:

```js
.note([60, 64, 67])  // C major chord (C, E, G)
```

And rests with `null`:

```js
.note([60, null, 64, null])  // C on beat 1, E on beat 3
```

## Root and scale

Working in raw MIDI numbers gets unwieldy. Set a root note and a scale to work in scale degrees instead.

#### `.root(note)`

Sets the root note. Accepts a MIDI number or a note name string like `"C4"`, `"A3"`, `"F#2"`.

```js
.root("C4")   // root is middle C
.root(60)     // same thing as a MIDI number
.root("Bb3")  // Bb below middle C
```

#### `.scale(name)`

Sets the scale. Once set, note values become scale degrees rather than MIDI numbers. Degree `0` is the root, `1` is the next note in the scale, and so on. Negative degrees go below the root; values beyond `6` climb into the next octave (`7` = root + one octave).

```js
d.synth("saw")
  .root("C4")
  .scale("minor")
  .note(0, 2, 4, 0) // C, Eb, G, C — the i, iii, v of C minor
  .push();
```

Available scales:

| Alias                                    | Scale           |
| ---------------------------------------- | --------------- |
| `"major"`, `"maj"`, `"ionian"`, `"ion"`  | Major           |
| `"minor"`, `"min"`, `"aeolian"`, `"aeo"` | Natural minor   |
| `"dorian"`, `"dor"`                      | Dorian mode     |
| `"phrygian"`, `"phr"`                    | Phrygian mode   |
| `"lydian"`, `"lyd"`                      | Lydian mode     |
| `"mixolydian"`, `"mix"`                  | Mixolydian mode |
| `"locrian"`, `"loc"`                     | Locrian mode    |

## Voices

The supersaw waveform is built from multiple detuned oscillators. `.voices()` controls how many oscillators make up the supersaw stack, cycling through voice counts across bars.

```js
d.synth("supersaw")
  .root("C3")
  .voices(4, 6, 8) // 4 voices bar 1, 6 bar 2, 8 bar 3, repeat
  .note(0)
  .push();
```

## Examples

A basic melody in C minor:

```js
d.synth("saw")
  .root("C4")
  .scale("minor")
  .note([0, 2, 4, 7], [0, 3, 5, 7])
  .adsr(0.01, 0.15, 0.6, 0.2)
  .gain(0.5)
  .push();
```

A layered pad with reverb:

```js
d.synth("sine", "triangle")
  .root("A3")
  .scale("dorian")
  .note([0, 4])
  .adsr(0.8, 0, 1, 1.2)
  .gain(0.3)
  .fx(d.reverb(0.6))
  .push();
```

A simple bassline, no scale:

```js
d.synth("saw")
  .note([36, null, 36, null, 39, null, 41, null])
  .adsr(0.005, 0.1, 0.4, 0.05)
  .filter("lp", 500)
  .push();
```

---

See [Instruments](./instruments.md) for all shared methods (gain, ADSR, filter, effects, patterns, etc.).
