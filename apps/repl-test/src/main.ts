import Drome from "drome-live";
import "./style.css";

const d = await Drome.init(120);

let lfoNode: AudioWorkletNode | undefined | null;
let gainNode: GainNode | undefined | null;
let oscillator: OscillatorNode | undefined | null;

const rateValues = [4, 2, 1, 0.5, 0.25, 0.125, 0.0625, 0.03125];
const rateLabels = ["1/64", "1/32", "1/16", "1/8", "1/4", "1/2", "1", "2"];

// UI Elements
const startBtn = document.querySelector<HTMLButtonElement>("#startBtn");
const stopBtn = document.querySelector<HTMLButtonElement>("#stopBtn");
const resetBtn = document.querySelector<HTMLButtonElement>("#resetBtn");
const bpmInput = document.querySelector<HTMLInputElement>("#bpm");
const rateSlider = document.querySelector<HTMLInputElement>("#rate");
const phaseSlider = document.querySelector<HTMLInputElement>("#phase");
const baseSlider = document.querySelector<HTMLInputElement>("#base");
const amountSlider = document.querySelector<HTMLInputElement>("#amount");
const status = document.getElementById("status");

// Value displays
const bpmValue = document.getElementById("bpmValue");
const rateValue = document.getElementById("rateValue");
const phaseValue = document.getElementById("phaseValue");
const baseValue = document.getElementById("baseValue");
const amountValue = document.getElementById("amountValue");

// Initialize audio
async function initAudio() {
  if (!startBtn || !status) return;
  try {
    // Create LFO node
    lfoNode = new AudioWorkletNode(d.ctx, "lfo-processor");

    // Create gain node for amplitude visualization
    gainNode = d.ctx.createGain();
    gainNode.gain.value = 0; // Start silent

    // Create oscillator to modulate
    oscillator = d.ctx.createOscillator();
    oscillator.frequency.value = 220;

    // Connect: LFO -> Gain -> Oscillator Frequency
    lfoNode.connect(gainNode);
    gainNode.connect(oscillator.frequency);
    oscillator.connect(d.ctx.destination);
    oscillator.start();

    // Update initial parameters
    updateFrequency();
    updatePhase();
    updateBase();
    updateAmount();

    startBtn.textContent = "Audio Running";
    startBtn.disabled = true;
    status.textContent = "LFO Active - Modulating oscillator frequency";
    status.classList.add("active");
  } catch (err) {
    console.error("Audio initialization failed:", err);
    status.textContent = "Error: " + (err as Error).message;
  }
}

function stopAudio() {
  if (!startBtn || !oscillator) return;

  oscillator?.stop();
  lfoNode?.disconnect();
  gainNode?.disconnect();
  oscillator?.disconnect();
  lfoNode = null;
  gainNode = null;
  oscillator = null;
  startBtn.textContent = "Start Audio";
  startBtn.disabled = false;
}

function updateFrequency() {
  if (!lfoNode || !bpmInput || !rateSlider || !gainNode) return;
  const bpm = parseFloat(bpmInput.value);
  const rateIndex = parseInt(rateSlider.value);
  const beatDuration = 60 / bpm;
  const frequency = 1 / (beatDuration * rateValues[rateIndex]);

  const frequencyParam = lfoNode.parameters.get("frequency");
  if (frequencyParam) frequencyParam.value = frequency;

  // Update gain to make frequency changes audible
  gainNode.gain.value = 200;
}

function updatePhase() {
  if (!lfoNode || !phaseSlider) return;
  const phaseParam = lfoNode.parameters.get("phaseOffset");
  if (phaseParam) phaseParam.value = parseFloat(phaseSlider.value);
}

function updateBase() {
  if (!lfoNode || !baseSlider) return;

  const baseValueParam = lfoNode.parameters.get("baseValue");
  if (baseValueParam) baseValueParam.value = parseFloat(baseSlider.value);
}

function updateAmount() {
  if (!lfoNode || !amountSlider) return;

  const amountParam = lfoNode.parameters.get("amount");
  if (amountParam) amountParam.value = parseFloat(amountSlider.value);
}

function resetPhase() {
  if (!lfoNode) return;
  lfoNode.port.postMessage({ type: "reset" });
}

// Event listeners
startBtn?.addEventListener("click", initAudio);
stopBtn?.addEventListener("click", stopAudio);
resetBtn?.addEventListener("click", resetPhase);

bpmInput?.addEventListener("input", (e) => {
  if (!bpmValue || !(e.target instanceof HTMLInputElement)) return;
  bpmValue.textContent = e.target.value;
  updateFrequency();
});

rateSlider?.addEventListener("input", (e) => {
  if (!rateValue || !(e.target instanceof HTMLInputElement)) return;
  const index = parseInt(e.target.value);
  rateValue.textContent = rateLabels[index];
  updateFrequency();
});

phaseSlider?.addEventListener("input", (e) => {
  if (!phaseValue || !(e.target instanceof HTMLInputElement)) return;
  phaseValue.textContent = e.target.value;
  updatePhase();
});

baseSlider?.addEventListener("input", (e) => {
  if (!baseValue || !(e.target instanceof HTMLInputElement)) return;
  baseValue.textContent = parseFloat(e.target.value).toFixed(2);
  updateBase();
});

amountSlider?.addEventListener("input", (e) => {
  if (!amountValue || !(e.target instanceof HTMLInputElement)) return;
  amountValue.textContent = parseFloat(e.target.value).toFixed(2);
  updateAmount();
});

// Initialize displays
if (rateValue && rateSlider) {
  rateValue.textContent = rateLabels[parseInt(rateSlider.value)];
}
