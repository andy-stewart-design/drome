import { Show } from 'solid-js'
import IconCollapseSidebar20 from '../icons/icon-collapse-sidebar-20'
import IconPause20 from '@/components/icons/icon-pause-20'
import IconPlay20 from '@/components/icons/icon-play-20'
import IconRefresh20 from '@/components/icons/icon-refresh-20'
import { useSession } from '@/providers/session'
import { usePlayState } from '@/providers/playstate'
import { useSidebar } from '@/providers/sidebar'
import { useDrome } from '@/providers/drome'
import { clst } from '@/utils/classlist'
import s from './style.module.css'

function EditorHeader() {
  const { workingSketch, workingScene } = useSession()
  const { beat, paused } = usePlayState()
  const { togglePlaystate } = useDrome()
  const { setShowSidebar } = useSidebar()

  return (
    <div class={s.header}>
      <div classList={clst(s.col, s.start)}>{workingSketch().title}</div>
      <div classList={clst(s.col, s.center)}>
        <span>
          Scene [<span class={s.digit}>{workingScene()}</span>]
        </span>
        <span>
          Beat [<span class={s.digit}>{beat()}</span>]
        </span>
      </div>
      <div classList={clst(s.col, s.end)}>
        <Show when={!paused()}>
          <button
            class={s.button}
            aria-label={`Evaluate code`}
            onClick={() => togglePlaystate(false)}
          >
            <IconRefresh20 />
          </button>
        </Show>
        <button
          class={s.button}
          aria-label={`Play/pause music`}
          onClick={() => togglePlaystate()}
        >
          {paused() ? <IconPlay20 aria-hidden /> : <IconPause20 aria-hidden />}
        </button>
        <button
          class={s.button}
          aria-label={`Show/hide sidebar`}
          onClick={() => setShowSidebar((c) => !c)}
        >
          <IconCollapseSidebar20 aria-hidden />
        </button>
      </div>
    </div>
  )
}

export default EditorHeader
