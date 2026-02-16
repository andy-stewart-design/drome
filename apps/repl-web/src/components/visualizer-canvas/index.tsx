import { useDrome } from '@/providers/drome'
import IconChevronRight16 from '@/components/icons/icon-chevron-right-16'
import s from './style.module.css'

function VisualizerCanvas() {
  const { setCanvas, setVisualizerType } = useDrome()

  return (
    <div class={s.container}>
      <canvas ref={setCanvas} class={s.canvas} width={320} height={180} />
      <div class={s.toolbar}>
        <button aria-label="Next visualizer type" onClick={setVisualizerType}>
          <IconChevronRight16 aria-hidden />
        </button>
      </div>
    </div>
  )
}

export default VisualizerCanvas
