import type Drome from "drome-live";
import { atom, effect } from "nanostores";

export const drome = atom<Drome | null>(null);
export const paused = atom(true);

effect([drome], (drome) => {
  if (!drome) return;
  console.log(drome);

  drome.clock.on("start", () => paused.set(false));
  drome.clock.on("stop", () => paused.set(true));

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
