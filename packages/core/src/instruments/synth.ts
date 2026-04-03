import Instrument, { type InstrumentOptions } from "./instrument";
import LfoNode from "@/automation/lfo-node";
import Envelope from "@/automation/envelope";
import SynthNode from "@/audio-nodes/composite-synth-node";
import { midiToFrequency } from "@/utils/midi-to-frequency";
import { noteToMidi } from "@/utils/note-string-to-frequency";
import { getWaveform } from "@/utils/synth-alias";
import type Drome from "@/index";
import type { NoteName, NoteValue, ScaleAlias, WaveformAlias } from "@/types";
import { getScale } from "@/utils/get-scale";
import FlatCycle from "@/array/flat-cycle";

interface SynthOptions extends InstrumentOptions {
  type?: WaveformAlias[];
}

export default class Synth extends Instrument {
  private _types: WaveformAlias[];
  private _voices: FlatCycle<number>;
  private _panspread: FlatCycle<number> | Envelope | LfoNode;
  private _freqspread: FlatCycle<number> | Envelope | LfoNode;
  private _root = 0;
  private _scale: number[] | null = null;

  constructor(drome: Drome, opts: SynthOptions) {
    super(drome, { ...opts, baseGain: 0.125 });
    this._types = opts.type?.length ? opts.type : ["sine"];
    this._voices = new FlatCycle(7);
    this._panspread = new FlatCycle(0.4);
    this._freqspread = new FlatCycle(0.2);
  }

  private getMidiNote(note: number) {
    if (!this._scale) return note + this._root;

    const octave = Math.floor(note / 7) * 12;
    const degree = ((note % 7) + 7) % 7;
    const step = this._scale[degree];
    return this._root + octave + step;
  }

  private getFrequency(note: number) {
    if (!this._scale) return midiToFrequency(note + this._root);

    const octave = Math.floor(note / 7) * 12;
    const degree = ((note % 7) + 7) % 7;
    const step = this._scale[degree];
    return midiToFrequency(this._root + octave + step);
  }

  voices(...input: (number | number[])[]) {
    this._voices.pattern(...input);
    return this;
  }

  panspread(
    input: Envelope | LfoNode | number | number[],
    ...rest: (number | number[])[]
  ) {
    if (input instanceof Envelope || input instanceof LfoNode) {
      this._panspread = input;
    } else {
      if (!(this._panspread instanceof FlatCycle))
        this._panspread = new FlatCycle(0.4);
      this._panspread.pattern(input, ...rest);
    }
    return this;
  }

  freqspread(
    input: Envelope | LfoNode | number | number[],
    ...rest: (number | number[])[]
  ) {
    if (input instanceof Envelope || input instanceof LfoNode) {
      this._freqspread = input;
    } else {
      if (!(this._freqspread instanceof FlatCycle))
        this._freqspread = new FlatCycle(0.2);
      this._freqspread.pattern(input, ...rest);
    }
    return this;
  }

  private applySupersawParams(
    node: SynthNode,
    start: number,
    duration: number,
    chordIndex: number,
  ) {
    const cycleIndex = this._drome.metronome.bar % this._voices.length;

    if (node.panspread) {
      if (this._panspread instanceof Envelope) {
        this._panspread.apply(
          node.panspread,
          start,
          duration,
          cycleIndex,
          chordIndex,
        );
      } else if (this._panspread instanceof LfoNode) {
        node.panspread.value = this._panspread.baseValue;
        this._panspread.connect(node.panspread);
      }
    }

    if (node.freqspread) {
      if (this._freqspread instanceof Envelope) {
        this._freqspread.apply(
          node.freqspread,
          start,
          duration,
          cycleIndex,
          chordIndex,
        );
      } else if (this._freqspread instanceof LfoNode) {
        node.freqspread.value = this._freqspread.baseValue;
        this._freqspread.connect(node.freqspread);
      }
    }
  }

  root(n: NoteName | NoteValue | number) {
    if (typeof n === "number") this._root = n;
    else this._root = noteToMidi(n) || 0;
    // this._cycles.defaultValue = [[0]];
    return this;
  }

  scale(name: ScaleAlias) {
    this._scale = getScale(name);
    return this;
  }

  push() {
    // this._drome.instruments.add(this);
    this._drome.queue(this);
  }

  play(barStart: number, barDuration: number) {
    const notes = this.beforePlay(barStart, barDuration);

    this._types.forEach((typeAlias) => {
      notes.forEach((note, chordIndex) => {
        if (!note) return;
        [note.value].flat().forEach((midiNote) => {
          if (midiNote == null) return;
          const bar = this._drome.metronome.bar;
          const cycleIndex = bar % this._voices.length;
          const panspreadCycleIndex =
            this._panspread instanceof FlatCycle
              ? bar % this._panspread.length
              : cycleIndex;
          const freqspreadCycleIndex =
            this._freqspread instanceof FlatCycle
              ? bar % this._freqspread.length
              : cycleIndex;
          const osc = new SynthNode(this.ctx, {
            frequency: this.getFrequency(midiNote),
            type: getWaveform(typeAlias),
            filter: this._filter.type ? { type: this._filter.type } : undefined,
            gain: 0,
            voices: this._voices.at(cycleIndex, chordIndex),
            panspread:
              this._panspread instanceof FlatCycle
                ? this._panspread.at(panspreadCycleIndex, chordIndex)
                : undefined,
            freqspread:
              this._freqspread instanceof FlatCycle
                ? this._freqspread.at(freqspreadCycleIndex, chordIndex)
                : undefined,
          });
          this._audioNodes.add(osc);

          const duration = this.applyNodeEffects(osc, note, chordIndex);
          this.applySupersawParams(osc, note.start, duration, chordIndex);

          osc.connect(this._connectorNode);
          osc.start(note.start);
          osc.stop(note.start + duration);

          if (this._midiRouter) {
            const start = this.clock.audioTimeToMIDITime(note.start);
            const end = this.clock.audioTimeToMIDITime(
              note.start + note.duration,
            );
            this._midiRouter?.noteOn(this.getMidiNote(midiNote), start);
            this._midiRouter?.noteOff(this.getMidiNote(midiNote), end);
          }

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
