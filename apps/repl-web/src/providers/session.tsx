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
import { useEditor } from './editor'

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
  addScene(dir?: 1 | -1): void
  deleteScene(): void
}

const SessionContext = createContext<SessionContextType>()

function SessionProvider(props: ParentProps) {
  const controller = new AbortController()
  const { user } = useUser()
  const { editor } = useEditor()

  const [workingScene, setWorkingScene] = createSignal(0)
  const [workingSketch, setWorkingSketch] = createSignal<db.WorkingSketch>(
    db.createSketch(),
  )
  const [savedSketches, setSavedSketches] = createSignal<db.SavedSketch[]>([])

  // ---- Helpers ----

  // clone=false when the caller already owns the object (e.g. fresh db result)
  function handleSetWorkingSketch(sketch: SketchSetter, clone = true) {
    const s = typeof sketch === 'function' ? sketch(workingSketch()) : sketch
    if (clone) setWorkingSketch(structuredClone(s))
    else setWorkingSketch(s)
  }

  const scenesAreDirty = () => {
    const working = workingSketch()
    const workingScenes = working.scenes
    const currentScene = workingScenes[workingScene()]

    // Short-circuit: empty scene is never dirty; unsaved sketch is always dirty;
    if (!currentScene.trim()) return false
    if (!('id' in working)) return true

    // otherwise compare scene arrays to the saved version.
    const savedScenes = savedSketches().find((s) => s.id === working.id)?.scenes
    return (
      savedScenes?.length !== workingScenes.length ||
      !savedScenes.every((s, i) => s === workingScenes[i])
    )
  }

  function handleUnload(e: Event) {
    if (scenesAreDirty()) e.preventDefault()
  }

  // ---- Lifecycle ----

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

  // ---- Sketch operations ----

  function createSketch() {
    setWorkingScene(0)
    setWorkingSketch(db.createSketch({ author: user().name }))
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

  // ---- Scene operations ----

  function switchScene(dir: 1 | -1 = 1) {
    const max = workingSketch().scenes.length
    const next = workingScene() + dir
    if (next < 0 || next >= max) return

    // Flush editor content into the working sketch before moving away
    const ed = editor()
    if (ed) {
      const currentCode = ed.state.doc.toString()
      handleSetWorkingSketch((s) => {
        const scenes = [...s.scenes]
        scenes[workingScene()] = currentCode
        return { ...s, scenes }
      })
    }

    setWorkingScene(next)
  }

  function addScene(dir: 1 | -1 = 1) {
    const current = workingSketch()
    const scenes = [...current.scenes]
    const insertAt = workingScene() + (dir === 1 ? 1 : 0)
    scenes.splice(insertAt, 0, scenes[workingScene()])
    handleSetWorkingSketch({ ...current, scenes })
    setWorkingScene(insertAt)
  }

  function deleteScene() {
    const scenes = workingSketch().scenes
    if (scenes.length <= 1) return
    const current = workingScene()
    const newScenes = scenes.filter((_, i) => i !== current)
    handleSetWorkingSketch((s) => ({ ...s, scenes: newScenes }))
    setWorkingScene(Math.min(current, newScenes.length - 1))
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
    deleteScene,
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
