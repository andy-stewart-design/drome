import type DromeArray from "@/array/drome-array";
import type Envelope from "@/automation/envelope";
// import type LFO from "@/automation/lfo";
import type * as algos from "@/utils/distortion-algorithms";

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
type Automation = Pattern | Envelope;
type Pattern = (number | number[])[];
type PatternInput = number | string;
type NSE = PatternInput | Envelope;

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
  Automation,
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
  NSE,
  Nullable,
  Pattern,
  PatternInput,
};
