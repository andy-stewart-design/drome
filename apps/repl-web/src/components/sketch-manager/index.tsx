import { createSignal, For, Show, type Accessor } from 'solid-js'
import { useSession } from '@/providers/session'
import { useEditor } from '@/providers/editor'
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
            <SketchLabel
              title={sketch.title}
              updated={sketch.updatedAt}
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
  title: string
  updated: string
  selected: Accessor<boolean>
  onSelect(): void
  onDelete(): void
}

function SketchLabel({
  title,
  updated,
  selected,
  onSelect,
  onDelete,
}: SketchLabelProps) {
  const updatedFormatted = new Intl.DateTimeFormat('en-US').format(
    new Date(updated),
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
          <EditableText text={title} />
          <p class={s.label_date}>{updatedFormatted}</p>
        </div>
        <button classList={clst(s.button, s.delete_button)} onClick={onDelete}>
          <IconClose12 />
        </button>
      </div>
    </li>
  )
}

function EditableText({ text }: { text: string }) {
  const [editing, setEditing] = createSignal(false)
  let inputRef: HTMLParagraphElement | undefined
  let triggerRef: HTMLButtonElement | undefined

  function handleKeyDown(e: KeyboardEvent) {
    if (!inputRef) return

    if (e.key === 'Enter' || e.key === 'Escape') {
      handleEditEnd(e)
      if (e.key === 'Escape') inputRef.innerHTML = text
    }
  }

  function handleEditEnd(e: Event) {
    e.preventDefault()
    setEditing(false)
    triggerRef?.focus()
  }

  return (
    <div class={s.editable_container}>
      <p
        ref={inputRef}
        class={s.label_title}
        contentEditable={editing()}
        spellcheck="false"
        onKeyDown={handleKeyDown}
        onBlur={handleEditEnd}
      >
        {text}
      </p>
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
    // <>
    //   <Show when={!editing()}>
    //     <p>
    //       {text} <span onClick={() => setEditing(true)}>Edit</span>
    //     </p>
    //   </Show>
    //   <Show when={editing()}>
    //     <input
    //       ref={inputRef}
    //       value={text}
    //       onKeyDown={(e) => {
    //         if (e.key === 'Enter' || e.key === 'Escape') {
    //           setEditing(false)
    //         }
    //       }}
    //     />
    //   </Show>
    // </>
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
