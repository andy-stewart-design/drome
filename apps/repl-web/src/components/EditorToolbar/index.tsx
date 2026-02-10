import { Show, type Accessor } from 'solid-js'
import IconPaused20 from '../Icons/IconPause20'
import IconPlay20 from '../Icons/IconPlay20'
import IconSidebar20 from '@/components/Icons/IconSidebar20'
import s from './style.module.css'

interface Props {
  beat: Accessor<number>
  paused: Accessor<boolean>
  onTogglePlaystate(): void
  onToggleSidebar(): void
  onReevaluate(): void
}

function EditorToolbar({
  beat,
  paused,
  onTogglePlaystate,
  onToggleSidebar,
  onReevaluate,
}: Props) {
  return (
    <div class={s.toolbar}>
      <Show when={!paused()}>
        <span class={s.beat}>{beat()}</span>
        <button aria-label={`Play/pause music`} onClick={onReevaluate}>
          <svg viewBox="0 0 20 20" fill="currentColor" width={20} height={20}>
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
            />
          </svg>
        </button>
      </Show>
      <button aria-label={`Play/pause music`} onClick={onTogglePlaystate}>
        {paused() ? <IconPlay20 aria-hidden /> : <IconPaused20 aria-hidden />}
      </button>
      <button aria-label={`Show/hide sidebar`} onClick={onToggleSidebar}>
        <IconSidebar20 aria-hidden />
      </button>
    </div>
  )
}

export default EditorToolbar
