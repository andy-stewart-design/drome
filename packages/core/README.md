# Drome

A web-based language for live coding music.

## TODOs

### Core
[x] Stacks
[x] Logging
[x] Listeners
[x] Merge 1-6-migrate into main
[-] MIDI Input
  [x] MIDI Controller: maintain cache of current cc values
  [-] Add beforeTick method to clock where I call unsubscriball
    [ ] Move listeners to queue system
  [x] MIDI CC: allow for all params
  [ ] MIDI note input
[-] MIDI Output
  [x] Add methods for translating clock time to DOMHighResTimeStamp (like performance.now()) 
  [x] Add methods for creating MIDI router 
  [ ] Add MIDI output logic to instrument play functions
[ ] Random arrays
[ ] Static pattern methods
[ ] Audio channels
[ ] Set root and scale on parent drome class
[ ] `instrument()` method (as wrapper for synth/sample)?
[ ] add Drome `destroy` method

### REPL
[ ] Play/pause buttons
[ ] Visualizer
[ ] Examples (dialog)
[ ] Console
[ ] MIDI interface
[ ] Sliders
