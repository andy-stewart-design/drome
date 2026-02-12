import { Show } from 'solid-js'
import IconPause20 from '@/components/icons/icon-pause-20'
import IconPlay20 from '@/components/icons/icon-play-20'
import IconSidebar20 from '@/components/icons/icon-sidebar-20'
import { usePlayState } from '@/providers/playstate'
import { useSidebar } from '@/providers/sidebar'
import { useSession } from '@/providers/session'
import { useDrome } from '@/providers/drome'
import { useEditor } from '@/providers/editor'
import { flash } from '@/codemirror/flash'
import s from './style.module.css'
import IconRefresh20 from '../icons/icon-refresh-20'

function EditorToolbar() {
  const { drome } = useDrome()
  const { editor } = useEditor()
  const { beat, paused } = usePlayState()
  const { setWorkingSketch } = useSession()
  const { setShowSidebar } = useSidebar()

  function togglePlaystate(_paused?: boolean) {
    const d = drome()
    const ed = editor()
    if (!d || !ed) return

    const paused = _paused ?? d.paused

    if (paused) {
      const code = ed.state.doc.toString()
      d.evaluate(code)
      flash(ed)
      if (d.paused) d.start()
      setWorkingSketch((s) => ({ ...s, code }))
    } else {
      d.stop()
    }
  }

  return (
    <div class={s.toolbar}>
      <Show when={!paused()}>
        <span class={s.beat}>{beat()}</span>
        <button
          aria-label={`Evaluate code`}
          onClick={() => togglePlaystate(true)}
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
