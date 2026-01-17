import Drome from 'drome-live'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { basicSetup, EditorView } from 'codemirror'
import { theme } from '@/codemirror/theme'
import { javascript } from '@/codemirror/language'
import { flash, flashField } from '@/codemirror/flash'
import '@/codemirror/theme-default.css'

export const Route = createFileRoute('/')({ component: App })

const LS_KEY = 'drome_sketch'

function App() {
  const editorContainer = useRef<HTMLDivElement>(null)
  const [drome, setDrome] = useState<Drome | null>(null)
  const [editor, setEditor] = useState<EditorView | null>(null)

  useEffect(() => {
    if (!editorContainer.current) return
    Drome.init(120).then((d) => setDrome(d))

    const doc = localStorage.getItem(LS_KEY)

    const editor = new EditorView({
      doc: doc ?? 'd.sample("bd:3").bank("tr909").euclid([3, 5], 8)',
      extensions: [basicSetup, theme, javascript(), flashField],
      parent: editorContainer.current,
    })

    setEditor(editor)

    return () => editor.destroy()
  }, [])

  useEffect(() => {
    if (!drome || !editor) return

    window.addEventListener('keydown', onkeyDown)

    return () => window.removeEventListener('keydown', onkeyDown)
  }, [drome, editor])

  function onkeyDown(e: KeyboardEvent) {
    if (!drome || !editor) return

    if (e.altKey && e.key === 'Enter') {
      e.preventDefault()
      drome.clear()
      runCode(drome, editor.state.doc.toString())
      localStorage.setItem(LS_KEY, editor.state.doc.toString())
      flash(editor)
      if (drome.paused) drome.start()
    } else if (e.altKey && e.key === '≥') {
      e.preventDefault()
      drome.stop()
    }
  }

  return (
    <main>
      {/*<div className="header">
        {!!drome && (
          <button
            className="midi"
            disabled={!!drome.midi}
            onClick={async () => {
              await drome?.createMidiController()
              console.log(drome?.midi)
            }}
          >
            {!!drome.midi ? 'MIDI enabled' : 'Enable MIDI'}
          </button>
        )}
      </div>*/}
      <div ref={editorContainer} />
    </main>
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
