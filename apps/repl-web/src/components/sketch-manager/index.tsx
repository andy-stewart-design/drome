import { For } from 'solid-js'

import IconArrowDown12 from '@/components/icons/icon-arrow-down-12'
import IconPlus12 from '@/components/icons/icon-plus-12'
import { useSession } from '@/providers/session'
import { useEditor } from '@/providers/editor'
import { clst } from '@/utils/classlist'

import SketchTab from './sketch-tab'
import s from './style.module.css'

function SketchManager() {
  const { editor } = useEditor()
  const {
    workingSketch,
    setWorkingSketch,
    savedSketches,
    saveSketch,
    deleteSketch,
    createSketch,
  } = useSession()

  function handleCreate() {
    createSketch()
  }

  function handleSave() {
    const ed = editor()
    if (!ed) return
    saveSketch(ed.state.doc.toString())
  }

  function handleDelete(id: number) {
    deleteSketch(id)
  }

  return (
    <div>
      <div class={s.toolbar}>
        <button classList={clst(s.button, s.tool)} onClick={handleSave}>
          <IconArrowDown12 /> Save
        </button>
        <button classList={clst(s.button, s.tool)} onClick={handleCreate}>
          <IconPlus12 /> New
        </button>
      </div>

      <ul class={s.list}>
        <For each={savedSketches()}>
          {(sketch) => (
            <SketchTab
              sketch={sketch}
              selected={workingSketch().title === sketch.title}
              onSelect={() => setWorkingSketch(sketch)}
              onDelete={() => handleDelete(sketch.id)}
            />
          )}
        </For>
      </ul>
    </div>
  )
}

export default SketchManager
