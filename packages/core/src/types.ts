type Nullable<T> = T | null | undefined;
type DromeCycleValue<T> = Nullable<T>[][];

type AdsrMode = "fit" | "clip" | "free";
type AdsrEnvelope = { a: number; d: number; s: number; r: number };

export type { AdsrEnvelope, AdsrMode, DromeCycleValue, Nullable };
