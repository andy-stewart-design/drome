import { onCleanup, onMount } from 'solid-js'
import { useDrome } from '@/providers/drome'
import { useSession } from '@/providers/session'
import { useEditor } from '@/providers/editor'
import { useTheme } from '@/providers/theme'

function useKeyboardEvent() {
  let controller = new AbortController()
  const { togglePlaystate } = useDrome()
  const { editor } = useEditor()
  const { saveSketch, createSketch } = useSession()
  const { setColorScheme } = useTheme()

  function handleKeyDown(e: KeyboardEvent) {
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
    } else if (e.altKey && e.shiftKey && e.key === '˜') {
      e.preventDefault()
      createSketch()
    } else if (e.altKey && e.key === '†') {
      e.preventDefault()
      setColorScheme()
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
