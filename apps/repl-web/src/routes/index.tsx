// TODO: where should the togglePlaystate function live?

import { createFileRoute } from '@tanstack/solid-router'

import CodeMirror from '@/components/code-mirror'
import EditorHeader from '@/components/editor-header'
import EditorToolbar from '@/components/editor-toolbar'
import MainLayout from '@/components/main-layout'
import MIDIManager from '@/components/midi-manager'
import SketchMetadata from '@/components/sketch-metadata'
import SketchManager from '@/components/sketch-manager'
import SidebarResizer from '@/components/sidebar-resizer'
import VisualizerCanvas from '@/components/visualizer-canvas'
import { useKeyboardEvent } from '@/utils/use-keyboard-event'
import * as Tabs from '@/components/sidebar-tabs'

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
          <Tabs.Tabs>
            <Tabs.List aria-label="Control panel">
              <Tabs.Tab id="sketches">Sketches</Tabs.Tab>
              <Tabs.Tab id="midi">MIDI</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panels>
              <Tabs.Panel id="sketches">
                <SketchManager />
              </Tabs.Panel>
              <Tabs.Panel id="midi">
                <MIDIManager />
              </Tabs.Panel>
            </Tabs.Panels>
          </Tabs.Tabs>
          <div style="flex: 0 0 0; padding: 1rem; border-block-start: 1px solid var(--app-color-border-subtle); display: flex; justify-content: flex-end; gap: 0.5rem; font-size: 0.8125rem;">
            <span>Console</span>
            <span>Settings</span>
          </div>
          {/*<SketchManager />*/}
          <SidebarResizer />
        </>
      }
    />
  )
}
