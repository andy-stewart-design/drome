import DromeArray from "@/array/drome-array";
// import type { Nullable } from "@/types";

class Pattern {
  private _value: DromeArray<number>;
  private _defaultValue: number;

  constructor(...input: (number | number[])[]) {
    const defaultValue = Array.isArray(input[0]) ? input[0][0] : input[0];
    if (defaultValue === undefined) throw new Error("Invalid pattern input");

    this._value = new DromeArray(defaultValue);
    this._value.note(...input);
    this._defaultValue = defaultValue;
  }

  note(...input: (number | number[])[]) {
    this._value.note(...input);
    return this;
  }

  apply(target: AudioParam, chordIndex: number, noteIndex: number) {
    target.value = this._value.at(chordIndex, noteIndex) ?? this._defaultValue;
  }
}

export default Pattern;
