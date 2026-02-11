import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, onCleanup, onMount, type Setter } from 'solid-js'
import type { EditorView } from 'codemirror'
import type Drome from 'drome-live'

import CodeMirror from '@/components/CodeMirror'
import { flash } from '@/codemirror/flash'
import { type WorkingSketch } from '@/utils/sketch-db'
import SketchMetadata from '@/components/SketchMetadata'
import SketchManager from '@/components/SketchManager'
import SidebarResizer from '@/components/SidebarResizer'
import EditorHeader from '@/components/EditorHeader'
import EditorToolbar from '@/components/EditorToolbar'
import { usePlayState } from '@/components/providers/playstate'
import { useSidebar } from '@/components/providers/sidebar'
import { useSession } from '@/components/providers/session'
import { useEditor } from '@/components/providers/editor'
import { useKeyboardEvent } from '@/utils/use-keyboard-event'

export const Route = createFileRoute('/')({ component: App })

function App() {
  // TODO: move to DromeContext
  const [drome, setDrome] = createSignal<Drome | undefined>(undefined)

  const { setPaused, setBeat } = usePlayState()
  const { showSidebar, sidebarSize } = useSidebar()
  const { workingSketch, setWorkingSketch } = useSession()
  const { editor } = useEditor()
  useKeyboardEvent(drome)

  onMount(() => {
    import('drome-live')
      .then(({ default: Drome }) => Drome.init(120))
      .then((d) => {
        setDrome(d)
        d.clock.on('start', () => setPaused(false))
        d.clock.on('stop', () => setPaused(true))
        d.clock.on('beat', ({ beat }) => setBeat(beat + 1))
      })
  })

  onCleanup(() => {
    drome()?.destroy()
    editor()?.destroy()
  })

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
          <SketchMetadata sketch={workingSketch} />
          <EditorToolbar
            onTogglePlaystate={() => {
              togglePlaystate(setWorkingSketch, drome(), editor())
            }}
            onReevaluate={() => {
              togglePlaystate(setWorkingSketch, drome(), editor(), true)
            }}
          />
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

// function runCode(drome: Drome, code: string) {
//   // const msg = drome.paused ? `◑ Evaluating code...` : `◑ Queuing update...`
//   // console.log(msg, 'input')
//   drome.evaluate(code)

//   // try {
//   //   const result = new Function('drome, d', `${code}`)(drome, drome)

//   //   // console.log(`✓ Code executed successfully`, 'output')
//   //   if (result !== undefined) {
//   //     console.log(`← ${result}`, 'output')
//   //   }
//   // } catch (error) {
//   //   console.log(`✗ ${(error as Error).message}`, 'error')
//   // }
// }

function togglePlaystate(
  setSketch: Setter<WorkingSketch>,
  drome?: Drome,
  editor?: EditorView,
  _paused?: boolean,
) {
  if (!drome || !editor) return

  const paused = _paused ?? drome.paused

  if (paused) {
    const code = editor.state.doc.toString()
    drome.evaluate(code)
    flash(editor)
    if (drome.paused) drome.start()
    setSketch((s) => ({ ...s, code }))
  } else {
    drome.stop()
  }
}

// function onKeyDown(
//   e: KeyboardEvent,
//   setSketch: Setter<WorkingSketch>,
//   drome?: Drome,
//   editor?: EditorView,
// ) {
//   if (!drome || !editor) return

//   if (e.altKey && e.key === 'Enter') {
//     e.preventDefault()
//     togglePlaystate(setSketch, drome, editor, true)
//   } else if (e.altKey && e.key === '≥') {
//     e.preventDefault()
//     togglePlaystate(setSketch, drome, editor, false)
//   }
// }
