import IconSidebar20 from '../Icons/IconSidebar20'
import s from './style.module.css'

interface Props {
  onToggleSidebar(): void
}

function EditorToolbar({ onToggleSidebar }: Props) {
  return (
    <div class={s.toolbar}>
      <button aria-label={`Toggle sidebar`} onClick={onToggleSidebar}>
        <IconSidebar20 aria-hidden />
      </button>
    </div>
  )
}

export default EditorToolbar
