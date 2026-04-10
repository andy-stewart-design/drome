const filterTypeMap = {
  bandpass: "bandpass",
  bp: "bandpass",
  highpass: "highpass",
  hp: "highpass",
  lowpass: "lowpass",
  lp: "lowpass",
} as const;

type FilterTypeAlias = keyof typeof filterTypeMap;

type FftSize =
  | 32
  | 64
  | 128
  | 256
  | 512
  | 1024
  | 2048
  | 4096
  | 8192
  | 16384
  | 32768;

export { filterTypeMap, type FilterTypeAlias, type FftSize };
