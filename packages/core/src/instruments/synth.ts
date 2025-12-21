import Instrument, { type InstrumentOptions } from "./instrument";
import SynthesizerNode from "@/audio-nodes/synthesizer-node";
import { midiToFrequency } from "@/utils/midi-to-frequency";
import type Drome from "@/index";

interface SynthOptions extends InstrumentOptions<number | number[]> {
  type?: OscillatorType[];
}

export default class Synth extends Instrument<number | number[]> {
  private _types: OscillatorType[];

  constructor(drome: Drome, opts: SynthOptions) {
    super(drome, { ...opts, baseGain: 0.125 });
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

          const duration = this.applyGain(
            osc,
            note.start,
            note.duration,
            chordIndex
          );

          this.applyFilter(osc, note.start, duration, chordIndex);
          this.applyDetune(osc, note.start, duration, chordIndex);

          osc.connect(this._connectorNode);
          osc.start(note.start);
          osc.stop(note.start + duration);

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
