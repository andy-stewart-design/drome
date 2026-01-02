import bitcrush from "@/worklets/worklet-bitcrusher.js?raw";
import distortion from "@/worklets/worklet-distortion.js?raw";
import lfoProcessor from "@/worklets/worklet-lfo?raw";
import supersawProcessor from "@/worklets/worklet-supersaw?raw";

const worklets = [bitcrush, distortion, lfoProcessor, supersawProcessor];

async function addWorklets(ctx: AudioContext) {
  const promises = worklets.map((code) => {
    const blob = new Blob([code], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    return ctx.audioWorklet.addModule(url);
  });
  await Promise.all(promises);
}

export { addWorklets };
