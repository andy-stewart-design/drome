import { onCleanup, onMount } from 'solid-js'
import { flash } from '@/codemirror/flash'
import { useEditor } from '@/providers/editor'
import { useSession } from '@/providers/session'
import { useDrome } from '@/providers/drome'

function useKeyboardEvent() {
  let controller = new AbortController()
  const { drome } = useDrome()
  const { editor } = useEditor()
  const { setWorkingSketch } = useSession()

  function handleKeyDown(e: KeyboardEvent) {
    const ed = editor()
    if (!drome || !ed) return

    if (e.altKey && e.key === 'Enter') {
      e.preventDefault()
      togglePlaystate(true)
    } else if (e.altKey && e.key === '≥') {
      e.preventDefault()
      togglePlaystate(false)
    }
  }

  function togglePlaystate(_paused?: boolean) {
    const ed = editor()
    const d = drome()
    if (!d || !ed) return

    const paused = _paused ?? d.paused

    if (paused) {
      const code = ed.state.doc.toString()
      d.evaluate(code)
      flash(ed)
      if (d.paused) d.start()
      setWorkingSketch((s) => ({ ...s, code }))
    } else {
      d.stop()
    }
  }

  onMount(() => {
    const { signal } = controller
    window.addEventListener('keydown', handleKeyDown, { signal })
  })

  onCleanup(() => {
    controller?.abort()
  })
}

export { useKeyboardEvent }
