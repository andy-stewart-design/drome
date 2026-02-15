import { useDrome } from '@/providers/drome'
import s from './style.module.css'

function VisualizerCanvas() {
  const { setCanvas, setVisualizerType } = useDrome()

  return (
    <canvas
      ref={setCanvas}
      class={s.canvas}
      width={320}
      height={180}
      onClick={setVisualizerType}
    />
  )
}

export default VisualizerCanvas
