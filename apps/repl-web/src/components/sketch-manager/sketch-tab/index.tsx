import EditableLabel from '../editable-label'
import IconClose12 from '@/components/icons/icon-close-12'
import { useSession } from '@/providers/session'
import { clst } from '@/utils/classlist'
import type { SavedSketch } from '@/utils/sketch-db'
import s from './style.module.css'

interface Props {
  sketch: SavedSketch
  selected: boolean
  onSelect(): void
  onDelete(): void
}

function SketchTab(props: Props) {
  const { updateSketch, setWorkingSketch } = useSession()

  function saveTitle(title: string) {
    updateSketch({ ...props.sketch, title })
    setWorkingSketch((c) => ({ ...c, title }))
  }

  const updatedFormatted = new Intl.DateTimeFormat('en-US').format(
    new Date(props.sketch.updatedAt),
  )

  return (
    <li class={s.label}>
      <button
        classList={clst(s.button, s.select_button)}
        onClick={props.onSelect}
        data-current={props.selected}
      />
      <div class={s.label_content}>
        <div class={s.label_text}>
          <EditableLabel
            id="sketch-title"
            value={props.sketch.title}
            onChange={saveTitle}
          />
          <p class={s.label_meta}>
            {updatedFormatted} · {props.sketch.author}
          </p>
        </div>
        <button
          classList={clst(s.button, s.delete_button)}
          onClick={props.onDelete}
        >
          <IconClose12 />
        </button>
      </div>
    </li>
  )
}

export default SketchTab
