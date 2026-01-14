import type { MIDIMessage } from "./midi-message";

class MIDIInputChangeEvent extends Event {
  static readonly eventName = "midi-input-change";
  readonly inputs: MIDIInput[];

  constructor(inputs: MIDIInputMap) {
    super(MIDIInputChangeEvent.eventName, { bubbles: true, composed: true });
    this.inputs = Array.from(inputs.values());
  }
}

class MIDIOutputChangeEvent extends Event {
  static readonly eventName = "midi-output-change";
  readonly outputs: MIDIOutput[];

  constructor(outputs: MIDIOutputMap) {
    super(MIDIOutputChangeEvent.eventName, { bubbles: true, composed: true });
    this.outputs = Array.from(outputs.values());
  }
}

class MIDIChannelMessageEvent extends Event {
  static readonly eventName = "midi-message";
  readonly data: MIDIMessage;

  constructor(data: MIDIMessage) {
    super(MIDIOutputChangeEvent.eventName, { bubbles: true, composed: true });
    this.data = data;
  }
}

export { MIDIInputChangeEvent, MIDIOutputChangeEvent, MIDIChannelMessageEvent };
