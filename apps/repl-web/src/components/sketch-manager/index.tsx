import { createSignal, For, onMount, Show, type Accessor } from 'solid-js'
import { useSession } from '@/providers/session'
import { useEditor } from '@/providers/editor'
import type { SavedSketch } from '@/utils/sketch-db'
import s from './style.module.css'
import AutosizeInput from '../autosize-input'

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
            <SketchLabel
              sketch={sketch}
              selected={() => workingSketch().title === sketch.title}
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

// -----------------------------------------------------------------
// -----------------------------------------------------------------
// -----------------------------------------------------------------

interface SketchLabelProps {
  sketch: SavedSketch
  selected: Accessor<boolean>
  onSelect(): void
  onDelete(): void
}

function SketchLabel({
  sketch,
  selected,
  onSelect,
  onDelete,
}: SketchLabelProps) {
  const updatedFormatted = new Intl.DateTimeFormat('en-US').format(
    new Date(sketch.updatedAt),
  )

  return (
    <li class={s.label}>
      <button
        classList={clst(s.button, s.select_button)}
        onClick={onSelect}
        data-current={selected()}
      />
      <div class={s.label_content}>
        <div class={s.label_text}>
          <EditableText sketch={sketch} />
          <p class={s.label_date}>
            {updatedFormatted} · {sketch.author}
          </p>
        </div>
        <button classList={clst(s.button, s.delete_button)} onClick={onDelete}>
          <IconClose12 />
        </button>
      </div>
    </li>
  )
}

function EditableText({ sketch }: { sketch: SavedSketch }) {
  const [title, setTitle] = createSignal(sketch.title)
  const [editing, setEditing] = createSignal(false)
  let inputRef: HTMLInputElement | undefined
  let triggerRef: HTMLButtonElement | undefined
  const { updateSketch } = useSession()

  onMount(() => {
    setInputSize()
    // console.log(inputRef)
  })

  function setInputSize() {
    if (!inputRef) return
    inputRef.size = Math.max(inputRef.value.length, 1)
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!inputRef) return

    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault()
      setEditing(false)
      triggerRef?.focus()
      if (e.key === 'Escape') setTitle(sketch.title)
    }

    setInputSize()
  }

  function handleBlur() {
    console.log('BLURRING')

    setEditing(false)
    setInputSize()
    requestAnimationFrame(() => {
      console.log('saving sketch', title())
      if (title() !== sketch.title) saveTitle(title())
    })
  }

  function saveTitle(title: string) {
    updateSketch({ ...sketch, title })
  }

  return (
    <div class={s.editable_container}>
      <AutosizeInput
        ref={inputRef}
        id=""
        class={s.label_title}
        disabled={!editing()}
        value={title()}
        onInput={(e) => {
          setTitle(e.currentTarget.value)
          e.currentTarget.size = Math.max(e.currentTarget.value.length, 1)
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      <Show when={!editing()}>
        <button
          ref={triggerRef}
          class={s.button}
          onClick={() => {
            setEditing(true)
            inputRef?.focus()
          }}
        >
          Edit
        </button>
      </Show>
    </div>
  )
}

function clst(...classNames: string[]) {
  return Object.fromEntries(classNames.map((cn) => [cn, true]))
}

function IconPlus12() {
  return (
    <svg viewBox="0 0 12 12" width={12} height={12}>
      <path d="M 6 2 L 6 10 M 2 6 L 10 6" stroke="currentColor" fill="none" />
    </svg>
  )
}

function IconArrowDown12() {
  return (
    <svg viewBox="0 0 12 12" width={12} height={12}>
      <path
        d="M 6 1 L 6 10 M 2 6 L 6 10 L 10 6"
        stroke="currentColor"
        fill="none"
      />
    </svg>
  )
}

function IconClose12() {
  return (
    <svg viewBox="0 0 12 12" width={12} height={12}>
      <path d="M 2 2 L 10 10 M 2 10 L 10 2" stroke="currentColor" fill="none" />
    </svg>
  )
}
