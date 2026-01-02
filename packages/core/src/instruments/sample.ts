import Instrument, { type InstrumentOptions } from "./instrument";
import SamplerNode from "@/audio-nodes/sample-node";
import { flipBuffer } from "../utils/flip-buffer";
import type Drome from "@/index";

type Nullable<T> = T | null | undefined;

interface SampleOptions extends InstrumentOptions<number> {
  sampleIds?: string[];
  sampleBank?: string;
  playbackRate?: number;
  loop?: boolean;
}

export default class Sample extends Instrument<number> {
  private _sampleIds: string[];
  private _sampleBank: string;
  private _buffer: AudioBuffer | undefined;
  private _playbackRate: number;
  private _loop: boolean;
  private _fitValue: number | undefined;
  private _cut = false;

  constructor(drome: Drome, opts: SampleOptions) {
    super(drome, { ...opts, baseGain: 0.75 });
    this._sampleIds = opts.sampleIds?.length ? opts.sampleIds : ["bd"];
    this._sampleBank = opts.sampleBank || "tr909";
    this._playbackRate = opts.playbackRate || 1;
    this._loop = opts.loop ?? false;
  }

  preloadSamples() {
    return this._sampleIds.map(async (id) => {
      const [name = "", index] = id.split(":");
      return this._drome.loadSample(this._sampleBank, name, index);
    });
  }

  bank(bank: string) {
    this._sampleBank = bank.toLocaleLowerCase();
    return this;
  }

  begin(...input: (Nullable<number> | Nullable<number>[])[]) {
    this._cycles.note(...input);
    return this;
  }

  chop(numChops: number, ...input: (number | number[])[]) {
    const isArray = Array.isArray;
    const convert = (n: Nullable<number>) => {
      return typeof n === "number" ? (1 / numChops) * (n % numChops) : null;
    };

    if (!input.length) {
      const chopsPerCycle = Math.floor(numChops / this._cycles.length) || 1;
      const step = 1 / (chopsPerCycle * this._cycles.length);

      this._cycles.value = Array.from(
        { length: this._cycles.length },
        (_, i) => {
          return Array.from({ length: chopsPerCycle }, (_, j) => {
            return step * j + chopsPerCycle * step * i;
          });
        }
      );
    } else {
      this._cycles.value = input.map((cycle) =>
        isArray(cycle) ? cycle.map((chord) => convert(chord)) : [convert(cycle)]
      );
    }

    return this;
  }

  cut() {
    this._cut = true;
    return this;
  }

  fit(numBars = 1) {
    this._fitValue = numBars;
    this.note(...Array.from({ length: numBars }, (_, i) => i / numBars));
    return this;
  }

  rate(n: number) {
    this._playbackRate = n;
    return this;
  }

  play(barStart: number, barDuration: number) {
    const notes = this.beforePlay(barStart, barDuration);

    this._sampleIds.forEach(async (sampleId) => {
      const bank = this._sampleBank;
      const [name = "", index] = sampleId.split(":");
      const { buffer } = await this._drome.loadSample(bank, name, index);

      notes.forEach((note, noteIndex) => {
        if (!buffer || typeof note?.value !== "number") return;

        const playbackRate = this._fitValue
          ? buffer.duration / barDuration / this._fitValue
          : Math.abs(this._playbackRate);

        const src = new SamplerNode(
          this.ctx,
          this._playbackRate < 0 ? flipBuffer(this.ctx, buffer) : buffer,
          {
            playbackRate,
            loop: this._loop,
            gain: 0,
            filter: this._filter.type ? { type: this._filter.type } : undefined,
          }
        );
        this._audioNodes.add(src);

        const _duration = this._cut ? note.duration : buffer.duration;
        const duration = this.applyGain(src, note.start, _duration, noteIndex);
        this.applyFilter(src, note.start, duration, noteIndex);
        this.applyDetune(src, note.start, duration, noteIndex);

        src.connect(this._connectorNode);
        src.start(note.start, note.value);
        src.stop(note.start + duration);

        const cleanup = () => {
          src.disconnect();
          src.removeEventListener("ended", cleanup);
          this._audioNodes.delete(src);
          // if (
          //   this._audioNodes.size === 0 &&
          //   isNumber(this._stopTime) &&
          //   this.ctx.currentTime > this._stopTime
          // ) {
          //   this._stopTime = null;
          //   this.cleanup();
          // }
        };

        src.addEventListener("ended", cleanup);
      });
    });
  }
}
