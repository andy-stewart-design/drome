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
type SetterArgs<T> = T | ((i: T) => T)
type SketchSetter = SetterArgs<db.WorkingSketch>
type SessionContextType = {
  workingSketch: Accessor<db.WorkingSketch>
  setWorkingSketch(sketch: SketchSetter, clone?: boolean): void
  savedSketches: Accessor<db.SavedSketch[]>
  setSavedSketches: Setter<db.SavedSketch[]>
  createSketch(): void
  updateSketch(sketch: db.SavedSketch): void
  saveSketch(code: string): Promise<void>
  deleteSketch(id: number): Promise<void>
  workingScene: Accessor<number>
  switchScene(dir?: 1 | -1): void
  addScene(): void
}

// Create context with undefined as default
const SessionContext = createContext<SessionContextType>()

// Provider component
function SessionProvider(props: ParentProps) {
  const controller = new AbortController()
  const { user } = useUser()
  const [workingScene, setWorkingScene] = createSignal(0)
  const [workingSketch, setWorkingSketch] = createSignal<db.WorkingSketch>(
    db.createSketch(),
  )
  const [savedSketches, setSavedSketches] = createSignal<db.SavedSketch[]>([])

  const scenesAreDirty = () => {
    const working = workingSketch()
    const b = workingSketch().scenes
    const workingCode = b[workingScene()]

    if (!workingCode.trim()) return false
    if (!('id' in working)) return true

    const allSaved = savedSketches()
    const a = allSaved.find((saved) => saved.id === working.id)?.scenes

    return a?.length !== b.length || !a.every((s, i) => s === b[i])
  }

  function handleUnload(e: Event) {
    if (scenesAreDirty()) e.preventDefault()
  }

  onMount(() => {
    db.getSketches().then((sketches) => {
      if (sketches) setSavedSketches(sketches)
      const sketch = db.getLatestSketch(sketches)
      handleSetWorkingSketch(sketch)
    })

    const { signal } = controller
    window.addEventListener('beforeunload', handleUnload, { signal })
  })

  onCleanup(() => {
    controller.abort()
  })

  function createSketch() {
    setWorkingScene(0)
    setWorkingSketch(db.createSketch({ author: user().name }))
  }

  function handleSetWorkingSketch(sketch: SketchSetter, clone = true) {
    const s = typeof sketch === 'function' ? sketch(workingSketch()) : sketch
    if (clone) setWorkingSketch(structuredClone(s))
    else setWorkingSketch(s)
  }

  async function saveSketch(code: string) {
    const s = workingSketch()
    const updatedScenes = [...s.scenes]
    updatedScenes[workingScene()] = code
    const result = await db.saveSketch({ ...s, code, scenes: updatedScenes })
    if (result.success) {
      setWorkingSketch(result.data)
      setSavedSketches((prev) => {
        const filtered = prev.filter((sk) => sk.id !== result.data.id)
        return [result.data, ...filtered]
      })
    }
  }

  async function updateSketch(sketch: db.SavedSketch) {
    const result = await db.updateSketch(sketch)
    if (result.success) {
      setSavedSketches((prev) => {
        const filtered = prev.filter((sk) => sk.id !== result.data.id)
        return [result.data, ...filtered]
      })
    }
  }

  async function deleteSketch(id: number) {
    const result = await db.deleteSketch(id)
    if (result.success) {
      setSavedSketches((prev) => prev.filter((sk) => sk.id !== id))
    }
  }

  // TODO: Maintain mouse position when switching scenes
  // TODO: Snapshot/save current working scene before switching scenes
  // TODO: Add ability to to delete current scene
  function switchScene(dir: 1 | -1 = 1) {
    const max = workingSketch().scenes.length
    const next = workingScene() + dir
    if (next < 0 || next >= max) return
    setWorkingScene(next)
  }

  function addScene() {
    const current = workingSketch()
    const scenes = [...current.scenes]
    scenes.push(scenes[workingScene()])
    handleSetWorkingSketch({ ...current, scenes })
    setWorkingScene(scenes.length - 1)
  }

  const contextValue = {
    workingSketch,
    setWorkingSketch: handleSetWorkingSketch,
    savedSketches,
    setSavedSketches,
    createSketch,
    saveSketch,
    updateSketch,
    deleteSketch,
    workingScene,
    switchScene,
    addScene,
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
