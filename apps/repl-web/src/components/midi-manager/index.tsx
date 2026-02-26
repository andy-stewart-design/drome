import { createEffect, createSignal, For, onCleanup, Show } from 'solid-js'
import { useDrome } from '@/providers/drome'
import IconCopy16 from '@/components/icons/icon-copy-16'
import IconCheck16 from '@/components/icons/icon-check-16'
import { copyToClipboard } from '@/utils/copy-to-clipboard'
import type { MIDIController } from 'drome-live'
import s from './style.module.css'

function MIDIManager() {
  const { drome } = useDrome()
  const [hasMIDIAccess, setHasMIDIAccess] = createSignal(false)
  const [inputs, setInputs] = createSignal<MIDIInput[]>([])
  const [outputs, setOutputs] = createSignal<MIDIOutput[]>([])
  const controller = new AbortController()

  async function requestAccess() {
    const midiController = await drome()?.createMidiController()
    if (midiController) setup(midiController)
  }

  function setup(midiController: MIDIController) {
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

  createEffect(() => {
    if (hasMIDIAccess()) return
    const midiController = drome()?.midiController
    if (midiController) setup(midiController)
  })

  onCleanup(() => {
    controller.abort()
  })

  return (
    <div class={s.container}>
      <Show
        when={hasMIDIAccess()}
        fallback={<RequestView requestAccess={requestAccess} />}
      >
        <p class={s.heading}>Inputs</p>
        <ol class={s.ports}>
          <For each={inputs()}>
            {(port) => (
              <li class={s.port}>
                <span class={s.label}>{port.name}</span>
                <CopyButton text={port.name ?? port.id} />
              </li>
            )}
          </For>
        </ol>
        <p class={s.heading}>Outputs</p>
        <ol class={s.ports}>
          <For each={outputs()}>
            {(port) => (
              <li class={s.port}>
                <span class={s.label}>{port.name}</span>
                <CopyButton text={port.name ?? port.id} />
              </li>
            )}
          </For>
        </ol>
      </Show>
    </div>
  )
}

export default MIDIManager

// MARK: Child components --------------------------------------------------
function RequestView({ requestAccess }: { requestAccess(): Promise<void> }) {
  return (
    <div class={s.requestContainer} data-theme="accent">
      <h3>Enable MIDI Access</h3>
      <p>
        We need to ask your browser for permission to connect to your MIDI
        devices. When the popup appears, click "Allow" to start sending and
        receiving data.
      </p>
      <button onClick={requestAccess}>Request Access</button>
    </div>
  )
}

function CopyButton(props: { text: string }) {
  const [success, setSuccess] = createSignal(false)
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  async function handleCopy() {
    const copied = await copyToClipboard(props.text)

    if (copied) {
      if (timeoutId) clearTimeout(timeoutId)
      setSuccess(true)

      timeoutId = setTimeout(() => {
        setSuccess(false)
        timeoutId = null
      }, 2000)
    } else {
      console.warn('Could not write to clipboard')
    }
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
