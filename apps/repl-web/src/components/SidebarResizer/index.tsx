import { createSignal, onMount } from 'solid-js'
import { useSidebar } from '@/providers/sidebar'
import s from './style.module.css'

function SidebarResizer() {
  const { setSidebarSize } = useSidebar()
  const [dragging, setDragging] = createSignal(false)
  const controller = new AbortController()

  onMount(() => {
    window.addEventListener(
      'pointermove',
      (e) => {
        if (dragging()) {
          setSidebarSize(window.innerWidth - e.clientX + 4)
        }
      },
      {
        signal: controller.signal,
      },
    )
    window.addEventListener('pointerup', () => setDragging(false), {
      signal: controller.signal,
    })
  })

  return (
    <div
      class={s.resizer}
      draggable={false}
      data-dragging={dragging()}
      onPointerDown={() => setDragging(true)}
      onPointerUp={() => setDragging(false)}
    />
  )
}

export default SidebarResizer
