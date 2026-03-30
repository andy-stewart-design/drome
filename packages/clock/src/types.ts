export type Metronome = { beat: number; bar: number };
export type DromeEventType =
  | "start"
  | "pause"
  | "stop"
  | "prebeat"
  | "prebar"
  | "beat"
  | "bar";
export type DromeEventCallback = (m: Metronome, time: number) => void;
