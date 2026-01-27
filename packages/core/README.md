# Drome

A web-based language for live coding music.

## TODOs

### Core
[x] Stacks
[x] Logging
[x] Listeners
[x] Merge 1-6-migrate into main
[x] MIDI CC Input
  [x] MIDI Controller: maintain cache of current cc values
  [x] Add beforeTick method to clock where I call unsubscriball
    [x] Move listeners to queue system
  [x] MIDI CC: allow for all params
[x] MIDI Output
  [x] Add methods for translating clock time to DOMHighResTimeStamp (like performance.now()) 
  [x] Add methods for creating MIDI router 
  [x] Add MIDI output logic to instrument play functions
  [x] Make sure cleanup is logic in eval cycle
[X] Sample Manager
[ ] Random arrays
[ ] add Drome `destroy` method
[ ] MIDI Note Input
[ ] Static pattern methods
[ ] Audio channels
[ ] Synth/SuperSaw: add ss-specific methods
[ ] Error handling (set up logging system)
[ ] `instrument()` method (as wrapper for synth/sample)?
[ ] Set root and scale on parent drome class

### REPL
[ ] Play/pause buttons
[ ] Visualizer
[ ] Examples (dialog)
[ ] Console
[ ] MIDI interface
[ ] Sliders
