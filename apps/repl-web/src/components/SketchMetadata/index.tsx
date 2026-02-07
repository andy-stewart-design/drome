import type { WorkingSketch } from '@/utils/sketch-db'
import { createSignal, type Accessor } from 'solid-js'
import s from './style.module.css'

function SketchMetadata({ sketch }: { sketch: Accessor<WorkingSketch> }) {
  const [open, setOpen] = createSignal(false)

  return (
    <details
      class={s.details}
      onToggle={(e) => {
        if (!(e.target instanceof HTMLDetailsElement)) return
        setOpen(e.target.open)
      }}
    >
      <summary>
        <Chevron /> Sketch Metadata {!open() && <span>{sketch().title}</span>}
      </summary>
      <div class={s.content}>
        <p>Title: {sketch().title}</p>
        <p>Author: {sketch().author}</p>
        <p class={s.date}>
          Last Saved: {new Date(sketch().updatedAt).toLocaleString()}
        </p>
      </div>
    </details>
  )
}

function Chevron() {
  return (
    <svg viewBox="0 0 12 12" width={16} height={16}>
      <path d="M 5 3 L 8 6 L 5 9" stroke="currentColor" />
    </svg>
  )
}

export default SketchMetadata
