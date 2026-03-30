import type Drome from "drome-live";

export const dromeState = $state({
  drome: null as Drome | null,
  paused: true,
  queued: false,
  activeEditor: null as string | null,
});

async function init() {
  const { default: Drome } = await import("drome-live");
  const d = await Drome.init();

  d.clock.on("start", () => {
    dromeState.paused = false;
  });
  d.clock.on("stop", () => {
    dromeState.paused = true;
    dromeState.activeEditor = null;
  });
  d.clock.on("bar", () => {
    dromeState.queued = false;
  });

  dromeState.drome = d;
}

if (typeof window !== "undefined") init();
