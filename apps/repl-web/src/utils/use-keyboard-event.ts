import { onCleanup, onMount } from 'solid-js'
import { useDrome } from '@/providers/drome'
import { useSession } from '@/providers/session'
import { useEditor } from '@/providers/editor'

function useKeyboardEvent() {
  let controller = new AbortController()
  const { togglePlaystate } = useDrome()
  const { editor } = useEditor()
  const { saveSketch, createSketch } = useSession()

  function handleKeyDown(e: KeyboardEvent) {
    console.log(e.key)
    if (e.altKey && e.key === 'Enter') {
      e.preventDefault()
      togglePlaystate(false)
    } else if (e.altKey && e.key === '≥') {
      e.preventDefault()
      togglePlaystate(true)
    } else if (e.metaKey && e.key === 's') {
      e.preventDefault()
      const ed = editor()
      if (!ed) return
      saveSketch(ed.state.doc.toString())
    } else if (e.altKey && e.key === 'Dead') {
      e.preventDefault()
      createSketch()
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
