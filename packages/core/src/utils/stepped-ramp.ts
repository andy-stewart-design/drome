import type { Nullable } from "@/types.js";
import { isNullish } from "@/utils/validators.js";

interface SteppedRampOptions {
  target: AudioParam;
  startTime: number;
  duration: number;
  steps: Nullable<number>[];
  fade?: number;
}

function applySteppedRamp(opts: SteppedRampOptions) {
  const { target, steps, fade = 0.001, startTime, duration } = opts;

  if (!steps.length) {
    console.warn("[DROME:applySteppedRamp] received empty step array");
    return;
  }

  const stepLength = (duration - fade * steps.length) / steps.length;

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (isNullish(step)) continue;
    const nextIndex = steps.findIndex((v, idx) => idx > i && v !== null);
    const stepOffset = nextIndex > i ? nextIndex - i : steps.length - i;
    target.linearRampToValueAtTime(step, startTime + stepLength * i + fade);
    target.setValueAtTime(step, startTime + stepLength * (i + stepOffset));
  }
}

export { applySteppedRamp };
