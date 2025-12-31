import DromeArray from "@/array/drome-array";
import DromeAudioNode from "@/abstracts/drome-audio-node";
import { isEnv, isLfoNode, isNullish } from "@/utils/validators";
import { applySteppedRamp } from "@/utils/stepped-ramp";
import type Envelope from "@/automation/envelope";
import type LfoNode from "@/automation/lfo-node";
import type { Automation, Note } from "@/types";

abstract class AutomatableEffect<T extends AudioNode> extends DromeAudioNode {
  protected abstract override _input: GainNode;
  protected abstract _effect: T;
  protected abstract _target: AudioParam | undefined;
  protected _defaultValue: number;
  protected _cycles: DromeArray<number>;
  protected _lfo: LfoNode | undefined;
  protected _env: Envelope | undefined;

  constructor(input: Automation, defaultValue = 1) {
    super();

    if (isEnv(input)) {
      this._defaultValue = input.startValue;
      this._cycles = new DromeArray(this._defaultValue);
      this._env = input;
    } else if (isLfoNode(input)) {
      this._defaultValue = input.baseValue;
      this._cycles = new DromeArray(this._defaultValue);
      this._lfo = input;
    } else {
      this._cycles = new DromeArray(0).note(...input);
      this._defaultValue = this._cycles.at(0, 0) ?? defaultValue;
    }
  }

  apply(
    notes: Note<unknown>[],
    currentBar: number,
    startTime: number,
    duration: number
  ) {
    if (!this._target) return;

    const cycleIndex = currentBar % this._cycles.length;
    if (this._lfo) {
      this._lfo.connect(this._target);
    } else if (this._env) {
      for (let i = 0; i < notes.length; i++) {
        const note = notes[i];
        if (isNullish(note)) continue;
        this._env.apply(this._target, note.start, note.duration, cycleIndex, i);
      }
    } else {
      const steps = this._cycles.at(cycleIndex) ?? [];
      applySteppedRamp({ target: this._target, startTime, duration, steps });
    }
  }

  connect(dest: AudioNode) {
    this._input.connect(this._effect).connect(dest);
  }

  disconnect() {
    this._input.disconnect();
  }

  get effect() {
    return this._effect;
  }

  get env() {
    return this._env;
  }

  get input() {
    return this._input;
  }

  // get lfo() {
  //   return this._lfo;
  // }
}

export default AutomatableEffect;
