import type Drome from "drome-live";
import { atom } from "nanostores";

export const drome = atom<Drome | null>(null);

async function init() {
  const { default: Drome } = await import("drome-live");
  const d = await Drome.init();
  drome.set(d);
}

if (typeof window !== "undefined") init();
