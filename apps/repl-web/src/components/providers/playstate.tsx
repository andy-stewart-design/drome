import {
  createContext,
  useContext,
  createSignal,
  type ParentComponent,
} from 'solid-js'

// Define the context type
type PlayStateContextType = {
  paused: () => boolean
  setPaused: (v: boolean) => void
  beat: () => number
  setBeat: (v: number) => void
}

// Create context with undefined as default
const PlayStateContext = createContext<PlayStateContextType>()

// Provider component
export const PlayStateProvider: ParentComponent = (props) => {
  const [paused, setPaused] = createSignal(true)
  const [beat, setBeat] = createSignal(1)

  const contextValue = {
    paused,
    setPaused,
    beat,
    setBeat,
  } satisfies PlayStateContextType

  return (
    <PlayStateContext.Provider value={contextValue}>
      {props.children}
    </PlayStateContext.Provider>
  )
}

// Typesafe hook that throws if used outside provider
export function usePlayStateContext(): PlayStateContextType {
  const context = useContext(PlayStateContext)
  if (context === undefined) {
    throw new Error(
      'usePlayStateContext must be used within a PlayStateProvider',
    )
  }
  return context
}
