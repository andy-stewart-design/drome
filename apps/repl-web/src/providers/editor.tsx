import {
  createContext,
  useContext,
  createSignal,
  type Accessor,
  type ParentProps,
  onCleanup,
} from 'solid-js'
import type { EditorView } from 'codemirror'

import { createCodeMirror } from '@/codemirror'
import '@/codemirror/theme.css'

// Define the context type
type EditorContextType = {
  editor: Accessor<EditorView | undefined>
  createEditor(parent: HTMLElement, doc: string): void
  isFlashed: Accessor<boolean>
  flash(dur?: number): void
}

// Create context with undefined as default
const EditorContext = createContext<EditorContextType>()

// Provider component
function EditorProvider(props: ParentProps) {
  const [editor, setEditor] = createSignal<EditorView | undefined>(undefined)
  const [isFlashed, setIsFlash] = createSignal(false)
  let timeoutId: ReturnType<typeof setTimeout> | null

  onCleanup(() => {
    editor()?.destroy()
  })

  function createEditor(parent: HTMLElement, doc: string) {
    setEditor(createCodeMirror(parent, doc))
  }

  function flash(dur = 300) {
    const ed = editor()
    if (!ed) return
    if (timeoutId) clearTimeout(timeoutId)

    const cursorPos = ed.state.selection.ranges[0].from
    setIsFlash(true)

    timeoutId = setTimeout(() => {
      setIsFlash(false)
      ed.focus()
      ed.dispatch({ selection: { anchor: cursorPos, head: cursorPos } })
      timeoutId = null
    }, dur)
  }

  const contextValue = {
    editor,
    createEditor,
    isFlashed,
    flash,
  } satisfies EditorContextType

  return (
    <EditorContext.Provider value={contextValue}>
      {props.children}
    </EditorContext.Provider>
  )
}

// Typesafe hook that throws if used outside provider
function useEditor() {
  const context = useContext(EditorContext)
  if (context === undefined) {
    throw new Error('useEditor must be used within a EditorProvider')
  }
  return context
}

export default EditorProvider
export { EditorProvider, useEditor }
