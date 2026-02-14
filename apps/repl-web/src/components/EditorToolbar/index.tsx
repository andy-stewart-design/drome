import { Show } from 'solid-js'
import IconPause20 from '@/components/icons/icon-pause-20'
import IconPlay20 from '@/components/icons/icon-play-20'
import IconSidebar20 from '@/components/icons/icon-sidebar-20'
import IconRefresh20 from '@/components/icons/icon-refresh-20'
import { usePlayState } from '@/providers/playstate'
import { useSidebar } from '@/providers/sidebar'
import { useDrome } from '@/providers/drome'
import s from './style.module.css'

function EditorToolbar() {
  const { togglePlaystate } = useDrome()
  const { beat, paused } = usePlayState()
  const { setShowSidebar } = useSidebar()

  return (
    <div class={s.toolbar}>
      <Show when={!paused()}>
        <span class={s.beat}>{beat()}</span>
        <button
          aria-label={`Evaluate code`}
          onClick={() => togglePlaystate(false)}
        >
          <IconRefresh20 />
        </button>
      </Show>
      <button aria-label={`Play/pause music`} onClick={() => togglePlaystate()}>
        {paused() ? <IconPlay20 aria-hidden /> : <IconPause20 aria-hidden />}
      </button>
      <button
        aria-label={`Show/hide sidebar`}
        onClick={() => setShowSidebar((c) => !c)}
      >
        <IconSidebar20 aria-hidden />
      </button>
    </div>
  )
}

export default EditorToolbar
