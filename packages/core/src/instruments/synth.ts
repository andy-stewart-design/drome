import Instrument, { type InstrumentOptions } from "./instrument";
import DromeArray from "@/array/drome-array";
import SynthNode from "@/audio-nodes/composite-synth-node";
import { midiToFrequency } from "@/utils/midi-to-frequency";
import { noteToMidi } from "@/utils/note-string-to-frequency";
import { getWaveform } from "@/utils/synth-alias";
import type Drome from "@/index";
import type { NoteName, NoteValue, WaveformAlias } from "@/types";

interface SynthOptions extends InstrumentOptions<number | number[]> {
  type?: WaveformAlias[];
}

export default class Synth extends Instrument<number | number[]> {
  private _types: WaveformAlias[];
  private _voices: DromeArray<number>;
  private _root = 0;

  constructor(drome: Drome, opts: SynthOptions) {
    super(drome, { ...opts, baseGain: 0.125 });
    this._types = opts.type?.length ? opts.type : ["sine"];
    this._voices = new DromeArray(7);
  }

  voices(...input: (number | number[])[]) {
    this._voices.note(...input);
    return this;
  }

  root(n: NoteName | NoteValue | number) {
    if (typeof n === "number") this._root = n;
    else this._root = noteToMidi(n) || 0;
    this._cycles.defaultValue = [[0]];
    return this;
  }

  push() {
    this._drome.instruments.add(this);
  }

  play(barStart: number, barDuration: number) {
    const notes = this.beforePlay(barStart, barDuration);

    this._types.forEach((typeAlias) => {
      notes.forEach((note, chordIndex) => {
        if (!note) return;
        [note?.value].flat().forEach((midiNote) => {
          // if (!midiNote) return;
          const cycleIndex = this._drome.metronome.bar % this._voices.length;
          const osc = new SynthNode(this.ctx, {
            frequency: midiToFrequency(midiNote + this._root),
            type: getWaveform(typeAlias),
            filter: this._filter.type ? { type: this._filter.type } : undefined,
            gain: 0,
            voices: this._voices.at(cycleIndex, chordIndex),
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
