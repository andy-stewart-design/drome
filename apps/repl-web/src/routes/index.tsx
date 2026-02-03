import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, onCleanup, onMount } from 'solid-js'
import type { EditorView } from 'codemirror'
import type Drome from 'drome-live'

import CodeMirror from '@/components/CodeMirror'
import { flash } from '@/codemirror/flash'

export const Route = createFileRoute('/')({ component: App })
const LS_KEY = 'drome_sketch'

function App() {
  const [drome, setDrome] = createSignal<Drome | undefined>(undefined)
  const [editor, setEditor] = createSignal<EditorView | undefined>(undefined)
  const controller = new AbortController()

  onMount(async () => {
    const { default: Drome } = await import('drome-live')

    const d = await Drome.init(120)
    setDrome(d)

    const { signal } = controller
    const handleKeyDown = (e: KeyboardEvent) => onKeyDown(e, drome(), editor())
    window.addEventListener('keydown', handleKeyDown, { signal })
  })

  onCleanup(() => {
    drome()?.destroy()
    editor()?.destroy()
    controller.abort()
  })

  return (
    <div
      style={{
        display: 'grid',
        'grid-template-columns': 'minmax(0,1fr) var(--app-sidebar-width)',
      }}
    >
      <CodeMirror onLoad={setEditor} />
    </div>
  )
}

function runCode(drome: Drome, code: string) {
  // const msg = drome.paused ? `◑ Evaluating code...` : `◑ Queuing update...`
  // console.log(msg, 'input')

  try {
    const result = new Function('drome, d', `${code}`)(drome, drome)

    // console.log(`✓ Code executed successfully`, 'output')
    if (result !== undefined) {
      console.log(`← ${result}`, 'output')
    }
  } catch (error) {
    console.log(`✗ ${(error as Error).message}`, 'error')
  }
}

function onKeyDown(e: KeyboardEvent, drome?: Drome, editor?: EditorView) {
  if (!drome || !editor) return

  if (e.altKey && e.key === 'Enter') {
    e.preventDefault()
    runCode(drome, editor.state.doc.toString())
    localStorage.setItem(LS_KEY, editor.state.doc.toString())
    flash(editor)
    if (drome.paused) drome.start()
  } else if (e.altKey && e.key === '≥') {
    e.preventDefault()
    drome.stop()
  }
}
