import AutomatableEffect from "@/abstracts/effect-automatable.js";
import type { Automatable } from "@/types.js";

interface DromeFilterOptions {
  pan: Automatable;
}

class PanEffect extends AutomatableEffect<StereoPannerNode> {
  protected _input: GainNode;
  protected _effect: StereoPannerNode;
  protected _target: AudioParam;

  constructor(ctx: AudioContext, { pan }: DromeFilterOptions) {
    super(pan);

    this._input = new GainNode(ctx);
    this._effect = new StereoPannerNode(ctx, { pan: this._defaultValue });
    this._target = this._effect.pan;
  }
}

export default PanEffect;
