// TODO: where should the togglePlaystate function live?

import { createFileRoute } from '@tanstack/solid-router'

import CodeMirror from '@/components/code-mirror'
import EditorHeader from '@/components/editor-header'
import EditorToolbar from '@/components/editor-toolbar'
import MainLayout from '@/components/main-layout'
import SketchMetadata from '@/components/sketch-metadata'
import SketchManager from '@/components/sketch-manager'
import SidebarResizer from '@/components/sidebar-resizer'
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
