import { createEffect, onMount } from 'solid-js'

import { basicSetup, EditorView } from 'codemirror'
import { theme } from '@/codemirror/theme'
import { javascript } from '@/codemirror/language'
import { flashField } from '@/codemirror/flash'

import s from './style.module.css'
import '@/codemirror/theme-default.css'
import { type WorkingSketch } from '@/utils/indexdb'

interface Props {
  editor: () => EditorView | undefined
  sketch: () => WorkingSketch
  onLoad: (ed: EditorView) => void
}

function CodeMirror({ editor, onLoad, sketch }: Props) {
  let editorContainer: HTMLDivElement | undefined

  onMount(() => {
    const ed = new EditorView({
      doc: sketch().code,
      extensions: [basicSetup, theme, javascript(), flashField],
      parent: editorContainer,
    })

    onLoad(ed)
  })

  createEffect(() => {
    const ed = editor()
    if (!ed) return

    ed.dispatch({
      changes: { from: 0, to: ed.state.doc.length, insert: sketch().code },
    })
  })

  return <div ref={editorContainer} class={s.container} />
}

export default CodeMirror
