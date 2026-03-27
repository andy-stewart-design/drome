// ============================================================
// Primitive types (inline copies — no imports)
// ============================================================

type AdsrMode = "fit" | "clip" | "free";

type FilterType = "bandpass" | "highpass" | "lowpass";

type BasicWaveform = "sawtooth" | "sine" | "square" | "triangle";

type WaveformAlias =
  | "saw"
  | "sawtooth"
  | "tri"
  | "triangle"
  | "sq"
  | "square"
  | "sin"
  | "sine"
  | "supersaw"
  | "ssaw"
  | "sup";

type DistortionAlgorithm =
  | "sigmoid"
  | "softClip"
  | "hardClip"
  | "fold"
  | "sineFold"
  | "cubic"
  | "diode"
  | "asymDiode"
  | "chebyshev";

// ============================================================
// AutomationDescriptor
// Serializable replacement for: Pattern | Envelope | LfoNode | MIDIObserver
// ============================================================

type AutomationDescriptor =
  // A stepped sequence of values, one per cycle step. Values can be chords (number[]).
  | { kind: "pattern"; values: (number | number[])[] }
  // ADSR envelope applied over the duration of each note.
  | { kind: "envelope"; a: number; d: number; s: number; r: number; mode?: AdsrMode }
  // LFO that modulates a parameter at a given rate (Hz or BPM-relative).
  | { kind: "lfo"; rate: number; depth: number; shape: BasicWaveform; phase?: number }
  // MIDI CC binding — value driven by incoming MIDI controller.
  | { kind: "midi"; cc: number; channel?: number };

// ============================================================
// EffectDescriptor
// Serializable replacement for DromeAudioNode instances in the signal chain.
// ============================================================

type EffectDescriptor =
  | {
      kind: "reverb";
      mix?: AutomationDescriptor;
      decay?: number;
      lpfStart?: number;
      lpfEnd?: number;
    }
  | {
      kind: "delay";
      // Array of delay times in seconds, stepped per cycle bar.
      delayTime: number[];
      feedback: number;
    }
  | {
      kind: "filter";
      type: FilterType;
      frequency: AutomationDescriptor;
      q?: number;
    }
  | {
      kind: "pan";
      value: AutomationDescriptor;
    }
  | {
      kind: "gain";
      value: AutomationDescriptor;
    }
  | {
      kind: "distortion";
      amount: AutomationDescriptor;
      algorithm?: DistortionAlgorithm;
      postgain?: number;
    }
  | {
      kind: "bitcrusher";
      bitDepth: AutomationDescriptor;
      rateReduction?: number;
    };

// ============================================================
// InstrumentSchema
// Base contract shared by all instrument types.
// ============================================================

interface InstrumentSchema {
  // -----------------------------------------------------------
  // Gain
  // -----------------------------------------------------------
  baseGain: number;
  gain: {
    // The peak/sustain gain level (0–1).
    base: number;
    // Optional ADSR shaping applied to each note's amplitude.
    adsr?: { a: number; d: number; s: number; r: number; mode?: AdsrMode };
    // Optional per-step or modulated gain override (e.g. a Pattern or LFO).
    automation?: AutomationDescriptor;
  };

  // -----------------------------------------------------------
  // Filter (absent when .filter() has never been called)
  // -----------------------------------------------------------
  filter?: {
    type: FilterType;
    frequency?: AutomationDescriptor;
    q?: AutomationDescriptor;
  };

  // -----------------------------------------------------------
  // Detune (absent when .detune() has never been called)
  // -----------------------------------------------------------
  detune?: AutomationDescriptor;

  // -----------------------------------------------------------
  // Effects signal chain — applied in array order
  // -----------------------------------------------------------
  effects: EffectDescriptor[];

  // -----------------------------------------------------------
  // Playback state
  // -----------------------------------------------------------
  muted: boolean;
  // false = off, true = hold through next note, number[] = hold for specific step indices
  legato: boolean | number[];

  // -----------------------------------------------------------
  // MIDI trigger input (absent when .midi() has never been called)
  // -----------------------------------------------------------
  midi?: {
    // MIDI device/port identifier string
    identifier: string;
    velocity?: AutomationDescriptor;
    channel?: number;
  };
}

// ============================================================
// SynthSchema
// Extends InstrumentSchema with oscillator-specific fields.
// ============================================================

interface SynthSchema extends InstrumentSchema {
  instrumentKind: "synth";

  // One oscillator node is created per waveform per note per step.
  waveforms: WaveformAlias[];

  // Supersaw voice count, stepped per cycle. Index matches cycle step.
  voices: number[];

  // MIDI root note offset (0 = C-1). Applied before scale mapping.
  root: number;

  // Scale intervals as semitone offsets from root.
  // null = chromatic (no mapping, note values used as-is).
  scale: number[] | null;

  // Cycle data. Outer array = bar arrangement, inner = steps.
  // Values are MIDI note numbers; arrays represent chords.
  cycles: (number | number[] | null)[][];
}

// ============================================================
// SamplerSchema
// Extends InstrumentSchema with sample-playback-specific fields.
// ============================================================

interface SamplerSchema extends InstrumentSchema {
  instrumentKind: "sampler";

  // Sample identifiers in "name:index" format (e.g. "bd:0", "hh:2").
  // One AudioBufferSourceNode is created per id per active step.
  sampleIds: string[];

  // Sample bank/library name used to resolve sampleIds.
  sampleBank: string;

  // Playback speed multiplier. Negative value = reverse playback.
  playbackRate: number;

  // Whether the sample loops continuously.
  loop: boolean;

  // Stretch sample to fill N bars. When set, overrides playbackRate.
  fit?: number;

  // When true, note duration controls how long the sample plays
  // instead of the sample's natural length.
  cut: boolean;

  // Cycle data. Outer array = bar arrangement, inner = steps.
  // Values are zero-based indices into sampleIds.
  cycles: (number | null)[][];
}
