import { createEffect, createSignal, onMount } from 'solid-js'
import { useEditor } from '@/providers/editor'
import { useSession } from '@/providers/session'
import s from './style.module.css'

function CodeMirror() {
  const { editor, createEditor } = useEditor()
  const { workingSketch } = useSession()
  const [flash, setFlash] = createSignal(false)
  let editorContainer: HTMLDivElement | undefined
  let timeoutId: ReturnType<typeof setTimeout> | null
  let controller: AbortController | undefined

  function handleFlash(dur = 200) {
    const ed = editor()
    if (!editorContainer || !ed) return
    if (timeoutId) clearTimeout(timeoutId)

    const cursorPos = ed.state.selection.ranges[0].from
    setFlash(true)

    timeoutId = setTimeout(() => {
      setFlash(false)
      ed.focus()
      ed.dispatch({ selection: { anchor: cursorPos, head: cursorPos } })
      timeoutId = null
    }, dur)
  }

  onMount(() => {
    if (!editorContainer) return
    createEditor(editorContainer)

    controller = new AbortController()
    const { signal } = controller
    window.addEventListener(
      'keydown',
      (e) => {
        if (e.altKey && e.key === '†') {
          e.preventDefault()
          // toggleTheme();
        } else if (e.altKey && e.key === 'Enter') {
          e.preventDefault()
          handleFlash(300)
        }
      },
      { signal },
    )
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
      inert={flash()}
      data-flash={flash()}
    />
  )
}

export default CodeMirror
