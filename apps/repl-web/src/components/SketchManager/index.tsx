import { For, type Accessor } from 'solid-js'
import type { SavedSketch } from '@/utils/sketch-db'

interface Props {
  sketches: Accessor<SavedSketch[]>
  onCreateNew(): void
  onReplace(sketch: SavedSketch): void
  onSave(): Promise<void>
  onDelete(id: number): Promise<void>
}

function SketchManager({
  sketches,
  onCreateNew,
  onReplace,
  onSave,
  onDelete,
}: Props) {
  return (
    <div>
      <button onClick={onCreateNew}>New</button>
      <button onClick={onSave}>Save</button>

      <ul style={{ padding: 0, margin: 0, 'list-style': 'none' }}>
        <For each={sketches()}>
          {(sketch) => (
            <li style={{ display: 'flex' }}>
              <div>
                <p style={{ margin: 0 }}>
                  <button
                    style={{ 'font-size': '13px' }}
                    onClick={() => onReplace(sketch)}
                  >
                    {sketch.title}
                  </button>
                  <span style={{ 'font-size': '13px', opacity: 0.6 }}>
                    {sketch.author}
                  </span>
                </p>
              </div>
              <button onClick={() => onDelete(sketch.id)}>✕</button>
            </li>
          )}
        </For>
      </ul>
    </div>
  )
}

export default SketchManager
