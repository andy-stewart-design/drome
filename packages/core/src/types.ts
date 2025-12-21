import type DromeArray from "@/array/drome-array.js";
import type Envelope from "@/automation/envelope.js";
// import type LFO from "@/automation/lfo.js";
import type * as algos from "@/utils/distortion-algorithms.js";

// AUDIO CLOCK
type Metronome = { beat: number; bar: number };
type DromeEventType = "start" | "pause" | "stop" | "beat" | "bar";
type DromeEventCallback = (m: Metronome, time: number) => void;

// INSTRUMENTS
type InstrumentType = "synth" | "sample";

// CYCLE
type Nullable<T> = T | null | undefined;
type Note<T> = { value: T; start: number; duration: number } | null;
type DromeCycleValue<T> = Nullable<T>[][];
type StepPatternInput = number | string;
type StepPattern = (number | number[])[];
// type AutomatableInput = StepPatternInput | LFO | Envelope;
// type Automatable = StepPattern | LFO | Envelope;
// type RestInput = StepPattern | [string] | [LFO] | [Envelope];
type AutomatableInput = StepPatternInput | Envelope;
type Automatable = StepPattern | Envelope;
type RestInput = StepPattern | [string] | [Envelope];

// AUTOMATION
type AdsrMode = "fit" | "clip" | "free";
type AdsrEnvelope = { a: number; d: number; s: number; r: number };
type FilterType = "bandpass" | "highpass" | "lowpass";
type FilterOptions = {
  node: BiquadFilterNode;
  frequencies: DromeArray<number>;
};

// EFFECTS
type DistortionAlgorithm = keyof typeof algos;
type DistortionFunction = (typeof algos)[DistortionAlgorithm];

export type {
  AdsrEnvelope,
  AdsrMode,
  Automatable,
  AutomatableInput,
  DistortionAlgorithm,
  DistortionFunction,
  DromeCycleValue,
  DromeEventCallback,
  DromeEventType,
  FilterType,
  FilterOptions,
  InstrumentType,
  Metronome,
  Note,
  Nullable,
  RestInput,
  StepPattern,
  StepPatternInput,
};
