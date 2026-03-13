import type Drome from "drome-live";
import { atom, effect } from "nanostores";

export const drome = atom<Drome | null>(null);
export const paused = atom(true);
export const queued = atom(false);
export const activeEditor = atom<string | null>(null);

effect([drome], (drome) => {
  if (!drome) return;
  console.log(drome);

  drome.clock.on("start", () => paused.set(false));
  drome.clock.on("stop", () => {
    paused.set(true);
    activeEditor.set(null);
  });
  drome.clock.on("bar", () => queued.set(false));

  return () => {
    drome?.destroy();
  };
});

async function init() {
  const { default: Drome } = await import("drome-live");
  const d = await Drome.init();
  drome.set(d);
}

if (typeof window !== "undefined") init();
