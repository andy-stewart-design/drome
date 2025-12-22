import bitcrush from "@/worklets/worklet-bitcrusher.js?raw";
import distortion from "@/worklets/worklet-distortion.js?raw";
import sampleProcessor from "@/worklets/worklet-samples?raw";
import synthesizerProcessor from "@/worklets/worklet-synthesizer?raw";

const worklets = [bitcrush, distortion, sampleProcessor, synthesizerProcessor];

async function addWorklets(ctx: AudioContext) {
  const promises = worklets.map((code) => {
    const blob = new Blob([code], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    return ctx.audioWorklet.addModule(url);
  });
  await Promise.all(promises);
}

export { addWorklets };
