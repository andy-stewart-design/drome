I am working on generating documentation for this live coding music library. I need you to look through the src and write documentation that conforms to the following outline:

- Overview
  - Introduction (Drome is a minimalist live coding language for the web)
  - Why Drome? (Drome v. Strudel: Launch Quantization [changes applied on bar], Simple API interface, Modular audio chain, actually Just Javascript [no hacking the default behavior of JS])
  - First Sounds
- Organizing Sound
  - Intro to patterns
  - Pattern methods
- Making Sound
  - Instruments
  - Synthesizers
  - Samplers
  - Stacks
  - Effects
  - Envelopes
  - LFOs
  - MIDI
- Working with the Editor
  - Logging (`d.on("beat" | "bar")`, etc)

Create a page for each of the bullets above. Note that "Overview", "Organizing Sound", etc are groups of content, not pages. We just need a page for each sub-bullet.

Write in a friendly but straightforward tone that focuses on getting a beginner up to speed quickly on using this language. Output a mdx file into the docs-2 folder. Feel free to ask if you have any clarifying questions.

One important bit of context: you are in a monorepo, but nothing in this monorepo is relevant to this task outside of the directory you are currently in.
