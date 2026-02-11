import { onCleanup, onMount, type Accessor } from 'solid-js'
import { flash } from '@/codemirror/flash'
import { useEditor } from '@/components/providers/editor'
import { useSession } from '@/components/providers/session'
import type Drome from 'drome-live'

function useKeyboardEvent(drome: Accessor<Drome | undefined>) {
  let controller = new AbortController()
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
