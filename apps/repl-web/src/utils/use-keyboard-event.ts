import { onCleanup, onMount } from 'solid-js'
import { useDrome } from '@/providers/drome'

function useKeyboardEvent() {
  let controller = new AbortController()
  const { togglePlaystate } = useDrome()

  function handleKeyDown(e: KeyboardEvent) {
    if (e.altKey && e.key === 'Enter') {
      e.preventDefault()
      togglePlaystate(false)
    } else if (e.altKey && e.key === '≥') {
      e.preventDefault()
      togglePlaystate(true)
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
