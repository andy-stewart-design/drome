import Drome from "drome-live";
import "./style.css";

const d = await Drome.init(120);

let oscillator: OscillatorNode | undefined | null;
let lfoNode: ReturnType<typeof d.lfo> | undefined | null;

// UI Elements
const startBtn = document.querySelector<HTMLButtonElement>("#startBtn");
const stopBtn = document.querySelector<HTMLButtonElement>("#stopBtn");
const resetBtn = document.querySelector<HTMLButtonElement>("#resetBtn");
const oscTypeSelect = document.querySelector<HTMLSelectElement>("#oscType");
const normalizeInput = document.querySelector<HTMLInputElement>("#normalize");
const bpmInput = document.querySelector<HTMLInputElement>("#bpm");
const rateSlider = document.querySelector<HTMLInputElement>("#rate");
const phaseSlider = document.querySelector<HTMLInputElement>("#phase");
const amountSlider = document.querySelector<HTMLInputElement>("#amount");
const status = document.getElementById("status");

// Value displays
const bpmValue = document.getElementById("bpmValue");
const rateValue = document.getElementById("rateValue");
const phaseValue = document.getElementById("phaseValue");
const amountValue = document.getElementById("amountValue");

// Initialize audio
async function initAudio() {
  if (!startBtn || !status) return;
  try {
    console.log(normalizeInput?.checked);

    lfoNode = d.lfo(
      oscTypeSelect?.value as "sawtooth" | "sine" | "square" | "triangle",
      normalizeInput?.checked
    );
    // Update initial parameters
    updateFrequency();
    updatePhase();
    updateAmount();

    // Create oscillator to modulate
    oscillator = d.ctx.createOscillator();
    oscillator.frequency.value = 220;

    // Connect: LFO -> Oscillator Frequency
    lfoNode.connect(oscillator.frequency);
    lfoNode.start();
    oscillator.connect(d.ctx.destination);
    oscillator.start();

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
  oscillator?.disconnect();
  oscillator = null;
  lfoNode?.stop();
  lfoNode?.disconnect();
  lfoNode = null;
  startBtn.textContent = "Start Audio";
  startBtn.disabled = false;
}

function updateFrequency() {
  if (!lfoNode || !bpmInput || !rateSlider) return;
  lfoNode.bpm.value = parseFloat(bpmInput.value);
  lfoNode.rate.value = parseInt(rateSlider.value);
}

function updatePhase() {
  if (!lfoNode || !phaseSlider) return;
  lfoNode.phaseOffset.value = parseFloat(phaseSlider.value);
}

function updateAmount() {
  if (!lfoNode || !amountSlider) return;

  lfoNode.scale.value = parseFloat(amountSlider.value);
}

function resetPhase() {
  if (!lfoNode) return;
  lfoNode.reset();
}

// Event listeners
startBtn?.addEventListener("click", initAudio);
stopBtn?.addEventListener("click", stopAudio);
resetBtn?.addEventListener("click", resetPhase);

oscTypeSelect?.addEventListener("change", () => {
  lfoNode?.setOscillatorType(
    oscTypeSelect.value as "sawtooth" | "sine" | "square" | "triangle"
  );
});

normalizeInput?.addEventListener("change", () => {
  lfoNode?.normalize(normalizeInput.checked);
});

bpmInput?.addEventListener("input", (e) => {
  if (!bpmValue || !(e.target instanceof HTMLInputElement)) return;
  bpmValue.textContent = e.target.value;
  updateFrequency();
});

rateSlider?.addEventListener("input", (e) => {
  if (!rateValue || !(e.target instanceof HTMLInputElement)) return;
  rateValue.textContent = e.target.value;
  updateFrequency();
});

phaseSlider?.addEventListener("input", (e) => {
  if (!phaseValue || !(e.target instanceof HTMLInputElement)) return;
  phaseValue.textContent = e.target.value;
  updatePhase();
});

amountSlider?.addEventListener("input", (e) => {
  if (!amountValue || !(e.target instanceof HTMLInputElement)) return;
  amountValue.textContent = parseFloat(e.target.value).toFixed(2);
  updateAmount();
});
