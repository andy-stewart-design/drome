import { Show } from 'solid-js'
import IconPaused20 from '@/components/icons/IconPause20'
import IconPlay20 from '@/components/icons/IconPlay20'
import IconSidebar20 from '@/components/icons/IconSidebar20'
import { usePlayState } from '@/providers/playstate'
import { useSidebar } from '@/providers/sidebar'
import { useSession } from '@/providers/session'
import { useDrome } from '@/providers/drome'
import { useEditor } from '@/providers/editor'
import { flash } from '@/codemirror/flash'
import s from './style.module.css'

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
          aria-label={`Play/pause music`}
          onClick={() => togglePlaystate(true)}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width={20} height={20}>
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
            />
          </svg>
        </button>
      </Show>
      <button aria-label={`Play/pause music`} onClick={() => togglePlaystate()}>
        {paused() ? <IconPlay20 aria-hidden /> : <IconPaused20 aria-hidden />}
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
