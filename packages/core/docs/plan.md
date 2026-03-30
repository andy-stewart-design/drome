I want to implement a major refactor of this codebase. I have a few meta-objectives for this work:

1.  Divide the core package into multiple, smaller, isolated packages to make them easier to understand, maintain, and test (Deep modules from _A Philosophy of Software Design_)
2.  Move to a schema-based system where user code creates a contract that is then implemented by the audio engine (clear separation)
3.  Make writing documentation authoring and maintenance as automated as possible
4.  Distribution via AT Proto in addition to local storage via indexDB

```
├── apps
│   ├── repl
│   └── docs
│   └── demos (small UIs for testing individual packages)
├── packages
│   ├── orchestrator
│   ├── clock
│   └── patterns
│   │   ├── pattern-array
│   │   ├── random-array
│   └── language (user code that creates the schema)
│   └── audio-engine (web audio code that implements the schema)
│   └── audio-worklets (custom audio worklet code)
│   └── midi (observable-based wrapper for web midi api)
│   └── design system (css vars, components)
│   └── editor (codemirror)
│   └── visualizer (render audio stream to canvas)
│   └── indexDB (local data storage)
│   └── at-proto (distribution)
```

I also have a few, focused goals:

1. Standardize the definition/implementation of patterns across all language methods
2. Allow for MIDI note input in addition to CC input (ideally quantized)
