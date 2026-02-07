import { For, type Accessor } from 'solid-js'
import type { SavedSketch, WorkingSketch } from '@/utils/sketch-db'
import s from './style.module.css'

interface Props {
  sketches: Accessor<SavedSketch[]>
  currentSketch: Accessor<WorkingSketch>
  onCreateNew(): void
  onReplace(sketch: SavedSketch): void
  onSave(): Promise<void>
  onDelete(id: number): Promise<void>
}

function SketchManager({
  sketches,
  currentSketch,
  onCreateNew,
  onReplace,
  onSave,
  onDelete,
}: Props) {
  return (
    <div>
      <div class={s.toolbar}>
        <button classList={clst(s.button, s.tool)} onClick={onSave}>
          Save
        </button>
        <button classList={clst(s.button, s.tool)} onClick={onCreateNew}>
          + New
        </button>
      </div>

      <ul class={s.list}>
        <For each={sketches()}>
          {(sketch) => (
            <li class={s.item}>
              <button
                classList={clst(s.button, s.primary)}
                onClick={() => onReplace(sketch)}
                data-current={currentSketch().title === sketch.title}
              >
                <p>{sketch.title}</p>
                <p>{sketch.author}</p>
              </button>
              <button
                classList={clst(s.button, s.delete)}
                onClick={() => onDelete(sketch.id)}
              >
                ✕
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
