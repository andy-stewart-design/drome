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
import * as db from '@/utils/sketch-db'
import { useUser } from './user'

// Define the context type
type SessionContextType = {
  workingSketch: Accessor<db.WorkingSketch>
  setWorkingSketch: Setter<db.WorkingSketch>
  savedSketches: Accessor<db.SavedSketch[]>
  setSavedSketches: Setter<db.SavedSketch[]>
  createSketch(): void
  updateSketch(sketch: db.SavedSketch): void
  saveSketch(code: string): Promise<void>
  deleteSketch(id: number): Promise<void>
}

// Create context with undefined as default
const SessionContext = createContext<SessionContextType>()

// Provider component
function SessionProvider(props: ParentProps) {
  const controller = new AbortController()
  const { user } = useUser()
  const [workingSketch, setWorkingSketch] = createSignal<db.WorkingSketch>(
    db.createSketch(),
  )
  const [savedSketches, setSavedSketches] = createSignal<db.SavedSketch[]>([])

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

  onMount(() => {
    db.getSketches().then((sketches) => {
      if (sketches) setSavedSketches(sketches)
      const sketch = db.getLatestSketch(sketches)
      setWorkingSketch(sketch)
    })

    const { signal } = controller
    window.addEventListener('beforeunload', handleUnload, { signal })
  })

  onCleanup(() => {
    controller.abort()
  })

  function createSketch() {
    setWorkingSketch(db.createSketch({ author: user().name }))
  }

  async function saveSketch(code: string) {
    const result = await db.saveSketch({ ...workingSketch(), code })
    if (result.success) {
      setWorkingSketch(result.data)
      const sketches = await db.getSketches()
      if (sketches) setSavedSketches(sketches)
    }
  }

  async function updateSketch(sketch: db.SavedSketch) {
    const result = await db.updateSketch(sketch)
    if (result.success) {
      const sketches = await db.getSketches()
      if (sketches) setSavedSketches(sketches)
    }
  }

  async function deleteSketch(id: number) {
    db.deleteSketch(id)
    const sketches = await db.getSketches()
    if (sketches) setSavedSketches(sketches)
  }

  const contextValue = {
    workingSketch,
    setWorkingSketch,
    savedSketches,
    setSavedSketches,
    createSketch,
    saveSketch,
    updateSketch,
    deleteSketch,
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
