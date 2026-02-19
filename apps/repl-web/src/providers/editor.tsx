import {
  createContext,
  useContext,
  createSignal,
  type Accessor,
  type ParentProps,
  onCleanup,
} from 'solid-js'
import { basicSetup, EditorView } from 'codemirror'

import { useSession } from '@/providers/session'
import { javascript } from '@/codemirror-2/language'
import { theme } from '@/codemirror-2/theme'
import '@/codemirror-2/theme.css'

// Define the context type
type EditorContextType = {
  editor: Accessor<EditorView | undefined>
  createEditor(parent: HTMLElement): void
}

// Create context with undefined as default
const EditorContext = createContext<EditorContextType>()

// Provider component
function EditorProvider(props: ParentProps) {
  const [editor, setEditor] = createSignal<EditorView | undefined>(undefined)
  const { workingSketch } = useSession()

  onCleanup(() => {
    editor()?.destroy()
  })

  function createEditor(parent: HTMLElement) {
    const ed = new EditorView({
      doc: workingSketch().code,
      extensions: [basicSetup, theme, javascript()],
      parent,
    })

    setEditor(ed)
  }

  const contextValue = { editor, createEditor } satisfies EditorContextType

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
