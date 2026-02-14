import { createEffect, onMount } from 'solid-js'
import { useEditor } from '@/providers/editor'
import { useSession } from '@/providers/session'
import s from './style.module.css'

function CodeMirror() {
  const { editor, createEditor } = useEditor()
  const { workingSketch } = useSession()
  let editorContainer: HTMLDivElement | undefined

  onMount(() => {
    if (!editorContainer) return
    createEditor(editorContainer)
  })

  createEffect(() => {
    const ed = editor()
    if (!ed) return

    if (ed.state.doc.toString() !== workingSketch().code) {
      ed.dispatch({
        changes: {
          from: 0,
          to: ed.state.doc.length,
          insert: workingSketch().code,
        },
      })
    }
  })

  return <div ref={editorContainer} class={s.container} />
}

export default CodeMirror
