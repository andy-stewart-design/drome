import { createSignal, For, onMount, Show, type Accessor } from 'solid-js'
import { useSession } from '@/providers/session'
import { useEditor } from '@/providers/editor'
import type { SavedSketch } from '@/utils/sketch-db'
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
          <p class={s.label_date}>{updatedFormatted}</p>
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
      <input
        ref={inputRef}
        id=""
        class={s.label_title}
        disabled={!editing()}
        value={title()}
        onInput={(e) => {
          setTitle(e.target.value)
          e.target.size = Math.max(e.target.value.length, 1)
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

// interface AutoWidthInputProps {
//   value?: string
//   placeholder?: string
//   onInput?: (value: string) => void
//   style?: JSX.CSSProperties
//   class?: string
//   ref: HTMLInputElement | undefined
// }

// function AutoWidthInput(props: AutoWidthInputProps): JSX.Element {
//   let mirrorRef: HTMLSpanElement | undefined
//   const [value, setValue] = createSignal(props.value ?? '')

//   onMount(() => {
//     syncWidth()
//   })

//   const syncWidth = () => {
//     if (!mirrorRef || !props.ref) return
//     mirrorRef.textContent = value() || props.placeholder || ''
//     const width = mirrorRef.offsetWidth
//     props.ref.style.width = `${width}px`
//   }

//   return (
//     <div style={{ display: 'inline-block', position: 'relative' }}>
//       <span
//         ref={mirrorRef}
//         aria-hidden="true"
//         style={{
//           position: 'absolute',
//           visibility: 'hidden',
//           'white-space': 'pre',
//           font: 'inherit',
//           'letter-spacing': 'inherit',
//           padding: 'inherit',
//           border: 'inherit',
//           'box-sizing': 'inherit',
//         }}
//       />
//       <input
//         ref={props.ref}
//         type="text"
//         value={value()}
//         placeholder={props.placeholder}
//         class={props.class}
//         style={{ 'white-space': 'nowrap', 'min-width': '1ch', ...props.style }}
//         onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
//           setValue(e.currentTarget.value)
//           syncWidth()
//           props.onInput?.(e.currentTarget.value)
//         }}
//       />
//     </div>
//   )
// }

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
