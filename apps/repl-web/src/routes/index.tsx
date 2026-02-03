import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, onCleanup, onMount } from 'solid-js'

import { basicSetup, EditorView } from 'codemirror'
import { theme } from '@/codemirror/theme'
import { javascript } from '@/codemirror/language'
import { flash, flashField } from '@/codemirror/flash'
import type Drome from 'drome-live'
import '@/codemirror/theme-default.css'

export const Route = createFileRoute('/')({ component: App })
const LS_KEY = 'drome_sketch'

function App() {
  const [drome, setDrome] = createSignal<Drome | undefined>(undefined)
  const [editor, setEditor] = createSignal<EditorView | undefined>(undefined)
  let editorContainer: HTMLDivElement | undefined
  const controller = new AbortController()

  onMount(async () => {
    const { default: Drome } = await import('drome-live')

    const doc = localStorage.getItem(LS_KEY)

    const ed = new EditorView({
      doc: doc ?? 'd.sample("bd:3").bank("tr909").euclid([3, 5], 8)',
      extensions: [basicSetup, theme, javascript(), flashField],
      parent: editorContainer,
    })

    setEditor(ed)

    const d = await Drome.init(120)
    setDrome(d)

    const { signal } = controller
    const handleKeyDown = (e: KeyboardEvent) => onkeyDown(e, drome(), editor())
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
        'grid-template-columns': 'minmax(0,1fr) 320px',
      }}
    >
      <div
        ref={editorContainer}
        style={{
          display: 'grid',
          width: '100%',
          border: '2px solid red',
          overflow: 'clip',
          '--cm-editor-width': '100%',
        }}
      />
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

function onkeyDown(e: KeyboardEvent, drome?: Drome, editor?: EditorView) {
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
