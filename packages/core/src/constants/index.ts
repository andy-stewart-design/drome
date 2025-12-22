const filterTypeMap = {
  bandpass: "bandpass",
  bp: "bandpass",
  highpass: "highpass",
  hp: "highpass",
  lowpass: "lowpass",
  lp: "lowpass",
} as const;

type FilterTypeAlias = keyof typeof filterTypeMap;

export { filterTypeMap, type FilterTypeAlias };
