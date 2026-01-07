import type DromeArray from "@/array/drome-array";
import type Envelope from "@/automation/envelope";
import type LfoNode from "./automation/lfo-node";
import type * as algos from "@/utils/distortion-algorithms";
import type {
  basicWaveformAliasMap,
  waveformAliasMap,
} from "./utils/synth-alias";
import type { scaleAliasMap } from "./utils/get-scale";

// AUDIO CLOCK
type Metronome = { beat: number; bar: number };
type DromeEventType = "start" | "pause" | "stop" | "beat" | "bar";
type DromeEventCallback = (m: Metronome, time: number) => void;

// NOTES + SCALES
type NaturalNote = "A" | "B" | "C" | "D" | "E" | "F" | "G";
type Accidental = "#" | "b";
type AccidentalNote = Exclude<
  `${NaturalNote}${Accidental}`,
  "B#" | "Cb" | "E#" | "Fb"
>;
type NoteNameUpper = NaturalNote | AccidentalNote;
type NoteName = NoteNameUpper | Lowercase<NoteNameUpper>;
type NoteValue = `${NoteName}${number}`;
type ScaleAlias = keyof typeof scaleAliasMap;

// INSTRUMENTS
type InstrumentType = "synth" | "sample";
type BasicWaveform = "sawtooth" | "sine" | "square" | "triangle";
type Waveform = BasicWaveform | "supersaw";
type BasicWaveformAlias = keyof typeof basicWaveformAliasMap;
type WaveformAlias = keyof typeof waveformAliasMap;

// CYCLE
type Nullable<T> = T | null | undefined;
type Note<T> = { value: T; start: number; duration: number } | null;
type DromeCycleValue<T> = Nullable<T>[][];
type Automation = Pattern | Envelope | LfoNode;
type Pattern = (number | number[])[];
type PatternInput = number | string;
type SNEL = PatternInput | Envelope | LfoNode;

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
  BasicWaveform,
  BasicWaveformAlias,
  DistortionAlgorithm,
  DistortionFunction,
  DromeCycleValue,
  DromeEventCallback,
  DromeEventType,
  FilterType,
  FilterOptions,
  InstrumentType,
  Metronome,
  NoteName,
  NoteValue,
  Note,
  ScaleAlias,
  SNEL,
  Nullable,
  Pattern,
  PatternInput,
  Waveform,
  WaveformAlias,
};
