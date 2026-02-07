import type { JSXElement } from 'solid-js'
import s from './style.module.css'

interface Props {
  children: JSXElement
}

function EditorHeader({ children }: Props) {
  return <div class={s.header}>{children}</div>
}

export default EditorHeader
