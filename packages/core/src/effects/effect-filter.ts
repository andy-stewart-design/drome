import AutomatableEffect from "@/abstracts/effect-automatable";
import Envelope from "@/automation/envelope";
import type { Automation, FilterType } from "@/types";

interface DromeFilterOptions {
  type: FilterType;
  frequency: Automation;
  q?: number;
}

class DromeFilter extends AutomatableEffect<BiquadFilterNode> {
  protected _input: GainNode;
  protected _effect: BiquadFilterNode;
  protected _target: AudioParam;

  constructor(ctx: AudioContext, opts: DromeFilterOptions) {
    const { type, frequency, q } = opts;
    super(frequency);

    this._input = new GainNode(ctx);
    this._effect = new BiquadFilterNode(ctx, {
      type,
      frequency: this._defaultValue,
      Q: q,
    });
    this._target = this._effect.frequency;
  }

  createEnvelope(max: number, adsr: number[]) {
    this._automation = new Envelope(this._defaultValue, max, 30)
      .att(adsr[0] ?? 0.125)
      .dec(adsr[1] ?? 0.125)
      .sus(adsr[2] ?? 1)
      .rel(adsr[3] ?? 0.01);
  }

  get type() {
    return this._effect.type;
  }
}

export default DromeFilter;
