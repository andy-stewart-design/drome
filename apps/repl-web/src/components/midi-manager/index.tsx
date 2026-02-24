import { createEffect, createSignal, For, onCleanup, Show } from 'solid-js'
import { useDrome } from '@/providers/drome'
import s from './style.module.css'
import IconCopy16 from '../icons/icon-copy-16'
import IconCheck16 from '../icons/icon-check-16'

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
    <div class={s.container}>
      <Show
        when={hasMIDIAccess()}
        fallback={<button onClick={requestAccess}>Enable MIDI</button>}
      >
        <p class={s.heading}>Inputs</p>
        <ol class={s.ports}>
          <For each={inputs()}>
            {(port) => (
              <li class={s.port}>
                <span class={s.label}>{port.name}</span>
                <CopyButton />
              </li>
            )}
          </For>
        </ol>
        <p class={s.heading}>Outputs</p>
        <ol class={s.ports}>
          <For each={outputs()}>{(port) => <li>{port.name}</li>}</For>
        </ol>
      </Show>
    </div>
  )
}

export default MIDIManager

function CopyButton() {
  const [success, setSuccess] = createSignal(false)
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  function handleCopy() {
    if (timeoutId) clearTimeout(timeoutId)

    setSuccess(true)
    timeoutId = setTimeout(() => {
      setSuccess(false)
      timeoutId = null
    }, 2000)
  }

  return (
    <button aria-label="Copy ID" onClick={handleCopy} data-success={success()}>
      <Show when={!success()}>
        <IconCopy16 />
      </Show>
      <Show when={success()}>
        <IconCheck16 />
      </Show>
    </button>
  )
}
