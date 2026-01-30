import DromeArray from "@/array/drome-array";
import DromeAudioNode from "@/abstracts/drome-audio-node";
import {
  isArray,
  isEnv,
  isLfoNode,
  isNullish,
  isObserver,
} from "@/utils/validators";
import { applySteppedRamp } from "@/utils/stepped-ramp";
import { MIDIObserver } from "@/midi";
import type Envelope from "@/automation/envelope";
import type LfoNode from "@/automation/lfo-node";
import type { Automation, Note } from "@/types";

abstract class AutomatableEffect<T extends AudioNode> extends DromeAudioNode {
  protected abstract override _input: GainNode;
  protected abstract _effect: T;
  protected abstract _target: AudioParam | undefined;
  protected _defaultValue: number;
  protected _cycles: DromeArray<number>;
  protected _automation:
    | LfoNode
    | Envelope
    | MIDIObserver<"controlchange">
    | undefined;

  constructor(input: Automation, defaultValue = 1) {
    super();

    switch (true) {
      case isEnv(input):
      case isLfoNode(input):
      case isObserver<"controlchange">(input):
        this._defaultValue = input.defaultValue;
        this._cycles = new DromeArray(this._defaultValue);
        this._automation = input;
        break;
      case isArray(input):
        this._cycles = new DromeArray(0).note(...input);
        this._defaultValue = this._cycles.at(0, 0) ?? defaultValue;
        break;
      default:
        console.warn("Invalid input", input satisfies never);
        this._defaultValue = defaultValue;
        this._cycles = new DromeArray(0);
    }
  }

  apply(
    notes: Note<unknown>[],
    currentBar: number,
    startTime: number,
    duration: number,
  ) {
    if (!this._target) return;

    const cycleIdx = currentBar % this._cycles.length;

    switch (true) {
      case isLfoNode(this._automation):
        this._automation.connect(this._target);
        break;
      case isEnv(this._automation):
        for (let i = 0; i < notes.length; i++) {
          const note = notes[i];
          if (isNullish(note)) continue;
          const { start, duration } = note;
          this._automation.apply(this._target, start, duration, cycleIdx, i);
        }
        break;
      case isObserver<"controlchange">(this._automation):
        this._target.setValueAtTime(this._automation.currentValue, startTime);
        this._automation.onUpdate(({ value }) => {
          this._target?.setValueAtTime(value, 0);
        });
        break;
      default:
        const steps = this._cycles.at(cycleIdx) ?? [];
        applySteppedRamp({ target: this._target, startTime, duration, steps });
    }
  }

  connect(dest: AudioNode) {
    this._input.connect(this._effect).connect(dest);
  }

  disconnect() {
    this._input.disconnect();
  }

  destroy() {
    this._target = undefined;
    this._automation = undefined;
    this._cycles.clear();
    this._defaultValue = 0;
  }

  get input() {
    return this._input;
  }
}

export default AutomatableEffect;
