import Instrument, { type InstrumentOptions } from "./instrument";
import { midiToFrequency } from "@/utils/midi-to-frequency";
import type Drome from "@/index";
import SynthesizerNode from "@/audio-nodes/synthesizer-node";

interface SynthOptions extends InstrumentOptions<number | number[]> {
  type?: OscillatorType[];
}

export default class Synth extends Instrument<number | number[]> {
  private _types: OscillatorType[];

  constructor(drome: Drome, opts: SynthOptions) {
    super(drome, { ...opts, baseGain: 0.25 });
    this._types = opts.type?.length ? opts.type : ["sine"];
  }

  play(barStart: number, barDuration: number) {
    const notes = this.beforePlay(barStart, barDuration);

    this._types.forEach((type) => {
      notes.forEach((note, chordIndex) => {
        if (!note) return;
        [note?.value].flat().forEach((midiNote) => {
          // if (!midiNote) return;
          const osc = new SynthesizerNode(this.ctx, {
            frequency: midiToFrequency(midiNote),
            type: type === "custom" ? "sine" : type,
            filterType: this._filter.type,
            gain: 0,
          });
          this._audioNodes.add(osc);

          const end = this._gain2.apply(osc.gain, note.start, note.duration);
          this.applyFilter(osc, note.start, note.start + end, chordIndex);
          this.applyDetune(osc, note.start, note.start + end, chordIndex);

          // osc.filterFrequency.setValueAtTime(0, note.start);
          // osc.filterFrequency.linearRampToValueAtTime(
          //   this._filter.frequency,
          //   note.start + end
          // );
          // osc.filterFrequency.setValueAtTime(
          //   1200,
          //   note.start + end - 0.5 * end
          // );
          // osc.filterFrequency.linearRampToValueAtTime(0, note.start + end);

          osc.connect(this._sourceNode);
          osc.start(note.start);
          osc.stop(note.start + end);

          const cleanup = () => {
            osc.disconnect();
            this._audioNodes.delete(osc);
            osc.removeEventListener("ended", cleanup);
          };

          osc.addEventListener("ended", cleanup);
        });
      });
    });
  }
}
