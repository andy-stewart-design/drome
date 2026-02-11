import { For } from 'solid-js'
import { useSession } from '@/components/providers/session'
import s from './style.module.css'

interface Props {
  onCreateNew(): void
  onSave(): Promise<void>
  onDelete(id: number): Promise<void>
}

function SketchManager({ onCreateNew, onSave, onDelete }: Props) {
  const { workingSketch, setWorkingSketch, savedSketches } = useSession()

  return (
    <div>
      <div class={s.toolbar}>
        <button classList={clst(s.button, s.tool)} onClick={onSave}>
          <IconArrowDown12 /> Save
        </button>
        <button classList={clst(s.button, s.tool)} onClick={onCreateNew}>
          <IconPlus12 /> New
        </button>
      </div>

      <ul class={s.list}>
        <For each={savedSketches()}>
          {(sketch) => (
            <li class={s.item}>
              <button
                classList={clst(s.button, s.primary)}
                onClick={() => setWorkingSketch(sketch)}
                data-current={workingSketch().title === sketch.title}
              >
                <p>{sketch.title}</p>
                <p>{sketch.author}</p>
              </button>
              <button
                classList={clst(s.button, s.delete)}
                onClick={() => onDelete(sketch.id)}
              >
                <IconClose12 />
              </button>
            </li>
          )}
        </For>
      </ul>
    </div>
  )
}

export default SketchManager

function clst(...classNames: string[]) {
  return Object.fromEntries(classNames.map((cn) => [cn, true]))
}

function IconPlus12() {
  return (
    <svg viewBox="0 0 12 12" width={12} height={12}>
      <path d="M 6 2 L 6 10 M 2 6 L 10 6" stroke="currentColor" fill="none" />
    </svg>
  )
}

function IconArrowDown12() {
  return (
    <svg viewBox="0 0 12 12" width={12} height={12}>
      <path
        d="M 6 1 L 6 10 M 2 6 L 6 10 L 10 6"
        stroke="currentColor"
        fill="none"
      />
    </svg>
  )
}

function IconClose12() {
  return (
    <svg viewBox="0 0 12 12" width={12} height={12}>
      <path d="M 2 2 L 10 10 M 2 10 L 10 2" stroke="currentColor" fill="none" />
    </svg>
  )
}
