class MockAudioWorkletProcessor {
  port = {
    onmessage: null as ((e: MessageEvent) => void) | null,
    postMessage(_msg: unknown) {},
  };
}

(globalThis as any).AudioWorkletProcessor = MockAudioWorkletProcessor;
(globalThis as any).__processors = {} as Record<string, any>;
(globalThis as any).registerProcessor = (id: string, cls: unknown) => {
  (globalThis as any).__processors[id] = cls;
};
(globalThis as any).currentTime = 0;
(globalThis as any).sampleRate = 44100;
