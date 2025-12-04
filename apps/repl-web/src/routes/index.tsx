import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { basicSetup, EditorView } from 'codemirror'
import { theme } from '@/codemirror/theme'
import Drome from 'drome-live'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const editorContainer = useRef<HTMLDivElement>(null)
  const [drome, setDrome] = useState<Drome | null>(null)
  const [editor, setEditor] = useState<EditorView | null>(null)

  useEffect(() => {
    if (!editorContainer.current) return
    Drome.init(120).then((d) => setDrome(d))

    const editor = new EditorView({
      doc: 'd.sample("bd:3").bank("tr909").euclid([3, 5], 8)',
      extensions: [basicSetup, theme],
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
    console.log('keydown', e.key)
    console.log()

    if (!drome || !editor) return

    if (e.altKey && e.key === 'Enter') {
      e.preventDefault()

      runCode(drome, editor.state.doc.toString())
      if (drome.paused) {
        drome.start()
      }
    } else if (e.altKey && e.key === '≥') {
      e.preventDefault()
      drome.stop()
      drome.clear()
    }
  }

  return (
    <main>
      <div ref={editorContainer} />
      {/* <textarea
        name="code"
        defaultValue='d.sample("bd:3").bank("tr909").euclid([3, 5], 8)'
        spellCheck={false}
        disabled={!drome}
      /> */}
    </main>
  )
}

function runCode(drome: Drome, code: string) {
  const msg = drome.paused ? `◑ Evaluating code...` : `◑ Queuing update...`
  console.log(msg, 'input')

  try {
    drome.clear()
    const result = new Function('drome, d', `${code}`)(drome, drome)

    console.log(`✓ Code executed successfully`, 'output')
    if (result !== undefined) {
      console.log(`← ${result}`, 'output')
    }
  } catch (error) {
    console.log(`✗ ${(error as Error).message}`, 'error')
  }
}
