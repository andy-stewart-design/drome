import { createFileRoute } from '@tanstack/solid-router'

import CodeMirror from '@/components/CodeMirror'
import EditorHeader from '@/components/EditorHeader'
import EditorToolbar from '@/components/EditorToolbar'
import SketchMetadata from '@/components/SketchMetadata'
import SketchManager from '@/components/SketchManager'
import SidebarResizer from '@/components/SidebarResizer'
import { useSidebar } from '@/components/providers/sidebar'
import { useKeyboardEvent } from '@/utils/use-keyboard-event'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { showSidebar, sidebarSize } = useSidebar()
  useKeyboardEvent()

  return (
    <div
      style={{
        display: 'grid',
        'grid-template-columns': `minmax(0,1fr) ${showSidebar() ? sidebarSize() : 0}px`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100dvh',
          display: 'flex',
          'flex-direction': 'column',
        }}
      >
        <EditorHeader>
          <SketchMetadata />
          <EditorToolbar />
        </EditorHeader>
        <CodeMirror />
      </div>
      <div
        style={{
          display: showSidebar() ? 'block' : 'none',
          position: 'relative',
          overflow: 'auto',
          'overscroll-behavior': 'contain',
          'border-inline-start': '1px solid rgb(255 255 255 / 0.15);',
        }}
      >
        <SketchManager />
        <SidebarResizer />
      </div>
    </div>
  )
}
