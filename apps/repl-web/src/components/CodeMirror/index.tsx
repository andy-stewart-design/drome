import { createEffect, onMount } from 'solid-js'
import { useEditor } from '@/providers/editor'
import { useSession } from '@/providers/session'
import s from './style.module.css'

function CodeMirror() {
  const { editor, createEditor, isFlashed } = useEditor()
  const { workingSketch } = useSession()
  let editorContainer: HTMLDivElement | undefined

  onMount(() => {
    if (!editorContainer) return
    createEditor(editorContainer)
  })

  createEffect(() => {
    const ed = editor()
    if (!ed) return
    const code = workingSketch().code

    if (ed.state.doc.toString() !== code) {
      ed.dispatch({
        changes: { from: 0, to: ed.state.doc.length, insert: code },
      })
    }
  })

  return (
    <div
      id="drome-editor"
      ref={editorContainer}
      class={s.container}
      inert={isFlashed()}
      data-flash={isFlashed()}
    />
  )
}

export default CodeMirror
