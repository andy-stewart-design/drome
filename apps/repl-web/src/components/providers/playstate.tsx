import {
  createContext,
  useContext,
  createSignal,
  type Accessor,
  type ParentProps,
  type Setter,
} from 'solid-js'

// Define the context type
type PlayStateContextType = {
  paused: Accessor<boolean>
  setPaused: Setter<boolean>
  beat: Accessor<number>
  setBeat: Setter<number>
}

// Create context with undefined as default
const PlayStateContext = createContext<PlayStateContextType>()

// Provider component
function PlayStateProvider(props: ParentProps) {
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
function usePlayState() {
  const context = useContext(PlayStateContext)
  if (context === undefined) {
    throw new Error(
      'usePlayStateContext must be used within a PlayStateProvider',
    )
  }
  return context
}

export default PlayStateProvider
export { PlayStateProvider, usePlayState }
