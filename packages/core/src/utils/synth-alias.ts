import type {
  BasicWaveform,
  BasicWaveformAlias,
  Waveform,
  WaveformAlias,
} from "@/types";

const basicWaveformAliasMap = {
  saw: "sawtooth",
  sawtooth: "sawtooth",
  tri: "triangle",
  triangle: "triangle",
  sq: "square",
  square: "square",
  sin: "sine",
  sine: "sine",
} satisfies Record<string, BasicWaveform>;

const waveformAliasMap = {
  ...basicWaveformAliasMap,
  supersaw: "supersaw",
  ssaw: "supersaw",
  sup: "supersaw",
} satisfies Record<string, Waveform>;

function getBasicWaveform(alias: BasicWaveformAlias) {
  return basicWaveformAliasMap[alias];
}

function getWaveform(alias: WaveformAlias) {
  return waveformAliasMap[alias];
}

export {
  basicWaveformAliasMap,
  getBasicWaveform,
  waveformAliasMap,
  getWaveform,
};
