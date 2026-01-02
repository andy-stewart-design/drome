import Instrument, { type InstrumentOptions } from "./instrument";
import SynthNode from "@/audio-nodes/synth-node";
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
          const osc = new SynthNode(this.ctx, {
            frequency: midiToFrequency(midiNote),
            type: type === "custom" ? "sine" : type,
            filter: this._filter.type ? { type: this._filter.type } : undefined,
            gain: 0,
          });
          this._audioNodes.add(osc);

          const duration = this.applyGain(
            osc,
            note.start,
            note.duration,
            chordIndex,
          );
          this.applyFilter(osc, note.start, duration, chordIndex);
          this.applyDetune(osc, note.start, duration, chordIndex);

          osc.connect(this._connectorNode);
          osc.start(note.start);
          osc.stop(note.start + duration);

          const cleanup = () => {
            osc.disconnect();
            osc.removeEventListener("ended", cleanup);
            this._audioNodes.delete(osc);
            osc.destory();

            if (this._stopTime && this._audioNodes.size === 0) {
              this.destroy();
            }
          };

          osc.addEventListener("ended", cleanup);
        });
      });
    });
  }
}
