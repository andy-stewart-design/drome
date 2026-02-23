import { useDrome } from '@/providers/drome'
import { createSignal, onMount, Show } from 'solid-js'

function MIDIManager() {
  const { drome } = useDrome()
  const [hasMIDIAccess, setHasMIDIAccess] = createSignal(false)

  onMount(() => {
    if (drome()?.midi) setHasMIDIAccess(true)
  })

  return (
    <div style={{ padding: '1rem' }}>
      <Show
        when={hasMIDIAccess()}
        fallback={
          <button onClick={() => drome()?.createMidiController()}>
            Enable MIDI
          </button>
        }
      >
        <p>You now have MIDI access</p>
      </Show>
    </div>
  )
}

export default MIDIManager
