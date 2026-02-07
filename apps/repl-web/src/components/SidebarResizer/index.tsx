import { createSignal, onMount } from 'solid-js'
import s from './style.module.css'

interface Props {
  onResize(n: number): void
}

function SidebarResizer({ onResize }: Props) {
  const [dragging, setDragging] = createSignal(false)
  const controller = new AbortController()

  onMount(() => {
    window.addEventListener(
      'pointermove',
      (e) => {
        if (dragging()) {
          onResize(window.innerWidth - e.clientX)
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
