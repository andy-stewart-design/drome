import { createSignal, onMount } from 'solid-js'
import s from './style.module.css'

function SidebarResizer() {
  const [dragging, setDragging] = createSignal(false)
  const controller = new AbortController()

  onMount(() => {
    window.addEventListener(
      'pointermove',
      (e) => {
        if (dragging()) {
          document.documentElement.style.setProperty(
            '--app-sidebar-width',
            `${window.innerWidth - e.clientX}px`,
          )
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
