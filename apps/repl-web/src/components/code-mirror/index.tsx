import { createEffect, onMount } from 'solid-js'
import { useEditor } from '@/providers/editor'
import { useSession } from '@/providers/session'
import s from './style.module.css'

function CodeMirror() {
  const { editor, createEditor, isFlashed } = useEditor()
  const { workingSketch, workingScene } = useSession()
  let editorContainer: HTMLDivElement | undefined

  onMount(() => {
    if (!editorContainer) return
    createEditor(editorContainer, workingSketch().scenes[workingScene()])
  })

  createEffect(() => {
    const ed = editor()
    if (!ed) return
    const code = workingSketch().scenes[workingScene()]

    if (ed.state.doc.toString() !== code) {
      const cursorPos = ed.state.selection.ranges[0].from
      ed.dispatch({
        changes: { from: 0, to: ed.state.doc.length, insert: code },
        selection: {
          anchor: Math.min(cursorPos, code.length),
          head: Math.min(cursorPos, code.length),
        },
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
