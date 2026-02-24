import { useDrome } from '@/providers/drome'
import { createEffect, createSignal, For, onCleanup, Show } from 'solid-js'

function MIDIManager() {
  const { drome } = useDrome()
  const [hasMIDIAccess, setHasMIDIAccess] = createSignal(false)
  const [inputs, setInputs] = createSignal<MIDIInput[]>([])
  const [outputs, setOutputs] = createSignal<MIDIOutput[]>([])
  const controller = new AbortController()

  async function requestAccess() {
    const midiController = await drome()?.createMidiController()
    if (midiController) {
      setHasMIDIAccess(true)
      const observer = midiController
        .createObserver('portchange')
        .onUpdate(() => {
          setInputs(midiController.inputs)
          setOutputs(midiController.outputs)
        })
      midiController.addObserver(observer, controller.signal)
      setInputs(midiController.inputs)
      setOutputs(midiController.outputs)
    }
  }

  createEffect(() => {
    const midiController = drome()?.midiController

    if (midiController) {
      setHasMIDIAccess(true)
      const observer = midiController
        .createObserver('portchange')
        .onUpdate(() => {
          setInputs(midiController.inputs)
          setOutputs(midiController.outputs)
        })
      midiController.addObserver(observer, controller.signal)
      setInputs(midiController.inputs)
      setOutputs(midiController.outputs)
    }
  })

  onCleanup(() => {
    controller.abort()
  })

  return (
    <div style={{ padding: '1rem' }}>
      <Show
        when={hasMIDIAccess()}
        fallback={<button onClick={requestAccess}>Enable MIDI</button>}
      >
        <p>Inputs</p>
        <ul>
          <For each={inputs()}>{(port) => <li>{port.name}</li>}</For>
        </ul>
        <p>Outputs</p>
        <ul>
          <For each={outputs()}>{(port) => <li>{port.name}</li>}</For>
        </ul>
      </Show>
    </div>
  )
}

export default MIDIManager
