import { createSignal, For, Show, type Accessor } from 'solid-js'
import { useSession } from '@/providers/session'
import { useEditor } from '@/providers/editor'
import type { SavedSketch } from '@/utils/sketch-db'
import s from './style.module.css'
import AutosizeInput from '@/components/autosize-input'

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
  const { updateSketch } = useSession()

  function saveTitle(title: string) {
    updateSketch({ ...sketch, title })
  }

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
          <EditableText
            id="sketch-title"
            value={sketch.title}
            onValueChanged={saveTitle}
          />
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

interface EditableTextProps {
  value: string
  id: string
  onValueChanged(value: string): void
}

function EditableText(props: EditableTextProps) {
  const [value, setValue] = createSignal(props.value)
  const [editing, setEditing] = createSignal(false)

  let inputRef: HTMLInputElement | undefined
  let triggerRef: HTMLButtonElement | undefined

  function handleKeyDown(e: KeyboardEvent) {
    if (!inputRef) return

    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault()
      setEditing(false)
      triggerRef?.focus()
      if (e.key === 'Escape') setValue(props.value)
    }
  }

  function handleBlur() {
    setEditing(false)

    requestAnimationFrame(() => {
      if (value() !== props.value) {
        props.onValueChanged(value())
      }
    })
  }

  return (
    <div class={s.editable_container}>
      <AutosizeInput
        ref={inputRef}
        id={props.id}
        class={s.label_title}
        disabled={!editing()}
        value={value()}
        onInput={(e) => {
          setValue(e.currentTarget.value)
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      <Show when={!editing()}>
        <button
          aria-label="Edit"
          ref={triggerRef}
          classList={clst(s.button, s.label_button)}
          onClick={() => {
            setEditing(true)
            inputRef?.focus()
          }}
        >
          <IconEdit16 />
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

function IconEdit16() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M6.93945 1.06055C7.52521 0.474914 8.47479 0.474913 9.06055 1.06055L10.9395 2.93946C11.5251 3.52521 11.5251 4.47479 10.9395 5.06055L5.84473 10.1553L5.75781 10.2354C5.54804 10.4144 5.29244 10.5329 5.01855 10.5762L1.76855 11.0889C1.26558 11.1683 0.831733 10.7344 0.911132 10.2314L1.42383 6.98145C1.46714 6.70756 1.58564 6.45196 1.76465 6.24219L1.84473 6.15528L6.93945 1.06055ZM2.90527 7.21582L2.55273 9.44629L4.78418 9.09473L9.87891 4L8 2.1211L2.90527 7.21582Z"
        fill="currentColor"
      />
    </svg>
  )
}
