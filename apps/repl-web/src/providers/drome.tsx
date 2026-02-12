import {
  createContext,
  useContext,
  createSignal,
  type Accessor,
  type ParentProps,
  onMount,
  onCleanup,
} from 'solid-js'
import type Drome from 'drome-live'
import { usePlayState } from './playstate'

// Define the context type
type DromeContextType = {
  drome: Accessor<Drome | undefined>
}

// Create context with undefined as default
const DromeContext = createContext<DromeContextType>()

// Provider component
function DromeProvider(props: ParentProps) {
  const [drome, setDrome] = createSignal<Drome | undefined>(undefined)
  const { setPaused, setBeat } = usePlayState()

  onMount(() => {
    import('drome-live')
      .then(({ default: Drome }) => Drome.init(120))
      .then((d) => {
        setDrome(d)
        d.clock.on('start', () => setPaused(false))
        d.clock.on('stop', () => setPaused(true))
        d.clock.on('beat', ({ beat }) => setBeat(beat + 1))
      })
  })

  onCleanup(() => {
    drome()?.destroy()
  })

  const contextValue = { drome } satisfies DromeContextType

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
