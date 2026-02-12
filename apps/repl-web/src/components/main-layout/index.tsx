import { useSidebar } from '@/providers/sidebar'
import type { JSXElement } from 'solid-js'
import s from './style.module.css'

interface Props {
  content: JSXElement
  sidebar: JSXElement
}

function MainLayout({ content: main, sidebar }: Props) {
  const { showSidebar, sidebarSize } = useSidebar()

  return (
    <div
      class={s.layout}
      style={{
        'grid-template-columns': `minmax(0,1fr) ${showSidebar() ? sidebarSize() : 0}px`,
      }}
    >
      <div class={s.content}>{main}</div>
      <div class={s.sidebar} data-visible={showSidebar()}>
        {sidebar}
      </div>
    </div>
  )
}

export default MainLayout
