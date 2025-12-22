import Drome from 'drome-live'
import { useEffect } from 'react'

interface Props {
  onLoad: (d: Drome) => void
}

function AudioContext({ onLoad }: Props) {
  useEffect(() => {
    Drome.init(120).then((d) => onLoad(d))
  }, [])

  return null
}

export default AudioContext
