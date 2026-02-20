import {
  createContext,
  createEffect,
  createSignal,
  onMount,
  onCleanup,
  useContext,
  type Accessor,
  type ParentProps,
  type Setter,
} from 'solid-js'
import AudioVisualizer from '@/utils/audio-visualizer'
import { usePlayState } from '@/providers/playstate'
import { useSession } from '@/providers/session'
import { useEditor } from '@/providers/editor'
import type Drome from 'drome-live'

// Define the context type
type DromeContextType = {
  setCanvas: Setter<HTMLCanvasElement | null>
  togglePlaystate(pause?: boolean): void
  setVisualizerType(): void
}

// Create context with undefined as default
const DromeContext = createContext<DromeContextType>()

// Provider component
function DromeProvider(props: ParentProps) {
  const [drome, setDrome] = createSignal<Drome | null>(null)
  const [canvas, setCanvas] = createSignal<HTMLCanvasElement | null>(null)
  const [visualizer, setVisualizer] = createSignal<AudioVisualizer | null>(null)
  const { setPaused, setBeat } = usePlayState()
  const { editor, flash } = useEditor()
  const { setWorkingSketch } = useSession()

  function togglePlaystate(pause?: boolean) {
    const ed = editor()
    const d = drome()
    const v = visualizer()
    if (!d || !ed) return

    const shouldPause = pause ?? !d.paused

    if (shouldPause) {
      d.stop()
      v?.stop()
    } else {
      const code = ed.state.doc.toString()
      d.evaluate(code)
      flash()
      if (d.paused) d.start()
      if (v?.paused) v?.start()
      setWorkingSketch((s) => ({ ...s, code }))
    }
  }

  onMount(() => {
    async function init() {
      const { default: Drome } = await import('drome-live')
      const d = await Drome.init(120)
      d.clock.on('start', () => setPaused(false))
      d.clock.on('stop', () => setPaused(true))
      d.clock.on('beat', ({ beat }) => setBeat(beat + 1))
      setDrome(d)
    }
    init()
  })

  createEffect(() => {
    const c = canvas()
    const d = drome()
    if (!c || !d) return

    const visualizer = new AudioVisualizer({
      audioContext: d.context,
      canvas: c,
      type: 'curve',
    })

    d.analyzer = visualizer.node
    setVisualizer(visualizer)
  })

  onCleanup(() => {
    drome()?.destroy()
    visualizer()?.destroy()
    setDrome(null)
    setVisualizer(null)
  })

  function setVisualizerType() {
    visualizer()?.nextType()
  }

  const contextValue = {
    setCanvas,
    togglePlaystate,
    setVisualizerType,
  } satisfies DromeContextType

  return (
    <DromeContext.Provider value={contextValue}>
      {props.children}
    </DromeContext.Provider>
  )
}

// Typesafe hook that throws if used outside provider
function useDrome() {
  const context = useContext(DromeContext)
  if (context === undefined) {
    throw new Error('useDrome must be used within a DromeProvider')
  }
  return context
}

export default DromeProvider
export { DromeProvider, useDrome }
