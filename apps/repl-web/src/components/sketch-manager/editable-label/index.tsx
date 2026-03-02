import { createSignal, Show } from 'solid-js'

import AutosizeInput from '@/components/autosize-input'
import IconEdit12 from '@/components/icons/icon-edit-12'
import { clst } from '@/utils/classlist'

import s from './style.module.css'

interface Props {
  value: string
  id: string
  onChange(value: string): void
}

function EditableLabel(props: Props) {
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
        props.onChange(value())
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
          <IconEdit12 />
        </button>
      </Show>
    </div>
  )
}

export default EditableLabel
