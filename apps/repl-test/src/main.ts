import Drome from "drome-live";
import "./style.css";

const d = await Drome.init(120);

// d.synth("sawtooth")
//   .note([72, 76, 79, 83], [69, 72, 76, 79])
//   .euclid(16, 32)
//   .adsr(0.01, 1, 0.75, 0.1)
//   .lpf(d.env(1000, 2000).adsr(0.01, 0.75, 0.125, 0.1))
//   .detune(d.lfo(0, 1000, 4))
//   .reverb(0.375);
// d.sample("bd:3").bank("tr909").euclid([3, 5], 8).gain(1);
// d.sample("hh:4").euclid(8, 8).pan(0.875).gain(0.375);
// d.sample("oh:1").euclid(4, 8, 1).pan(0.125).gain(0.5);

// const note = 48;
// const lfo = d.lfo(400, 1600, 16).type("sine");
// const lfo2 = d.lfo(-0.5, 0.5, 16).type("sine");
// d.synth("triangle")
//   .note(note)
//   .euclid(4, 4)
//   .lpf(lfo)
//   .crush(4)
//   .pan(lfo2)
//   .gain(d.env(0, 1).adsr(0.05, 1, 0.25));

d.sample("bass")
  .bank("sonicpi")
  .fit(2)
  .begin(0, 0.45)
  .lpf(200)
  .rel(0.1)
  .lpf(d.env(200, 1000).adsr(0.1, 0.25, 0.25))
  .cut();

document
  .querySelector<HTMLButtonElement>("#start")
  ?.addEventListener("click", () => d.start());

document
  .querySelector<HTMLButtonElement>("#stop")
  ?.addEventListener("click", () => d.stop());
