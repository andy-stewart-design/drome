import { onMount } from 'solid-js'

import { basicSetup, EditorView } from 'codemirror'
import { theme } from '@/codemirror/theme'
import { javascript } from '@/codemirror/language'
import { flashField } from '@/codemirror/flash'

import s from './style.module.css'
import '@/codemirror/theme-default.css'

const LS_KEY = 'drome_sketch'

function CodeMirror({ onLoad }: { onLoad: (ed: EditorView) => {} }) {
  let editorContainer: HTMLDivElement | undefined

  onMount(() => {
    const doc = localStorage.getItem(LS_KEY)

    const ed = new EditorView({
      doc: doc ?? 'd.sample("bd:3").bank("tr909").euclid([3, 5], 8)',
      extensions: [basicSetup, theme, javascript(), flashField],
      parent: editorContainer,
    })

    onLoad(ed)
  })

  return <div ref={editorContainer} class={s.container} />
}

export default CodeMirror
