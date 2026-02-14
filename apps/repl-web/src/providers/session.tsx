import {
  createContext,
  useContext,
  createSignal,
  onMount,
  onCleanup,
  type Accessor,
  type ParentProps,
  type Setter,
} from 'solid-js'
import {
  createSketch,
  getLatestSketch,
  getSketches,
  saveSketch,
  type SavedSketch,
  type WorkingSketch,
} from '@/utils/sketch-db'

// Define the context type
type SessionContextType = {
  workingSketch: Accessor<WorkingSketch>
  setWorkingSketch: Setter<WorkingSketch>
  savedSketches: Accessor<SavedSketch[]>
  setSavedSketches: Setter<SavedSketch[]>
  save(code: string): Promise<void>
}

// Create context with undefined as default
const SessionContext = createContext<SessionContextType>()

// Provider component
function SessionProvider(props: ParentProps) {
  const controller = new AbortController()
  const [workingSketch, setWorkingSketch] =
    createSignal<WorkingSketch>(createSketch())
  const [savedSketches, setSavedSketches] = createSignal<SavedSketch[]>([])

  onMount(() => {
    getSketches().then((sketches) => {
      if (sketches) setSavedSketches(sketches)
      const sketch = getLatestSketch(sketches)
      setWorkingSketch(sketch)
    })

    const { signal } = controller
    window.addEventListener('beforeunload', handleUnload, { signal })
  })

  onCleanup(() => {
    controller.abort()
  })

  async function save(code: string) {
    const result = await saveSketch({ ...workingSketch(), code })
    if (result.success) {
      setWorkingSketch(result.data)
      const sketches = await getSketches()
      if (sketches) setSavedSketches(sketches)
    }
  }

  function handleUnload(e: Event) {
    const working = workingSketch()
    const saved = savedSketches()

    if (!('id' in working)) {
      e.preventDefault()
      return
    }

    const savedSketch = saved.find((saved) => saved.id === working.id)
    if (!savedSketch || savedSketch.code !== working.code) {
      e.preventDefault()
    }
  }

  const contextValue = {
    workingSketch,
    setWorkingSketch,
    savedSketches,
    setSavedSketches,
    save,
  } satisfies SessionContextType

  return (
    <SessionContext.Provider value={contextValue}>
      {props.children}
    </SessionContext.Provider>
  )
}

// Typesafe hook that throws if used outside provider
function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}

export default SessionProvider
export { SessionProvider, useSession }
