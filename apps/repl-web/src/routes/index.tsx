// TODO: where should the togglePlaystate function live?

import { createFileRoute } from '@tanstack/solid-router'

import CodeMirror from '@/components/CodeMirror'
import EditorHeader from '@/components/EditorHeader'
import EditorToolbar from '@/components/EditorToolbar'
import MainLayout from '@/components/main-layout'
import SketchMetadata from '@/components/SketchMetadata'
import SketchManager from '@/components/SketchManager'
import SidebarResizer from '@/components/SidebarResizer'
import VisualizerCanvas from '@/components/visualizer-canvas'
import { useKeyboardEvent } from '@/utils/use-keyboard-event'

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
          <VisualizerCanvas />
          <SketchManager />
          <SidebarResizer />
        </>
      }
    />
  )
}
