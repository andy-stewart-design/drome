import { createFileRoute } from '@tanstack/solid-router'

import CodeMirror from '@/components/CodeMirror'
import EditorHeader from '@/components/EditorHeader'
import EditorToolbar from '@/components/EditorToolbar'
import SketchMetadata from '@/components/SketchMetadata'
import SketchManager from '@/components/SketchManager'
import SidebarResizer from '@/components/SidebarResizer'
import { useKeyboardEvent } from '@/utils/use-keyboard-event'
import MainLayout from '@/components/main-layout'

export const Route = createFileRoute('/')({ component: App })

function App() {
  useKeyboardEvent()

  return (
    <MainLayout
      content={
        <>
          <EditorHeader>
            <SketchMetadata />
            <EditorToolbar />
          </EditorHeader>
          <CodeMirror />
        </>
      }
      sidebar={
        <>
          <SketchManager />
          <SidebarResizer />
        </>
      }
    />
  )
}
