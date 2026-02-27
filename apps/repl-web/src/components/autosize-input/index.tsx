import { createEffect, type JSX } from 'solid-js'
import s from './style.module.css'

/* ─── Types ─── */
interface AutosizeInputProps {
  value: string
  onInput: JSX.EventHandler<HTMLInputElement, InputEvent>
  onKeyDown?: JSX.EventHandler<HTMLInputElement, KeyboardEvent>
  onBlur?: JSX.EventHandler<HTMLInputElement, FocusEvent>
  class?: string
  disabled?: boolean
  placeholder?: string
  id?: string
  'aria-label'?: string
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void)
}

/* ─── Reusable AutosizeInput ─── */

function AutosizeInput(props: AutosizeInputProps) {
  let inputEl: HTMLInputElement | undefined
  let mirrorEl: HTMLSpanElement | undefined

  createEffect(() => {
    if (!mirrorEl || !inputEl) return
    const text = props.value || props.placeholder || ''
    mirrorEl.textContent = text
    inputEl.style.width =
      Math.ceil(mirrorEl.getBoundingClientRect().width) + 1 + 'px'
  })

  return (
    <div class={s.container}>
      <span
        ref={mirrorEl}
        class={`${s.mirror} ${props.class ?? ''}`}
        aria-hidden="true"
      />
      <input
        ref={(el) => {
          inputEl = el
          if (typeof props.ref === 'function') {
            props.ref(el)
          }
        }}
        disabled={props.disabled}
        class={`${s.input} ${props.class ?? ''}`}
        value={props.value}
        placeholder={props.placeholder}
        onInput={props.onInput}
        onKeyDown={props.onKeyDown}
        onBlur={props.onBlur}
        id={props.id}
        aria-label={props['aria-label']}
      />
    </div>
  )
}

export default AutosizeInput
