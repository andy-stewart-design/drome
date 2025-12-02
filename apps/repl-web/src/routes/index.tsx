import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import Drome from 'drome-live'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [drome, setDrome] = useState<Drome | null>(null)

  useEffect(() => {
    Drome.init(120).then((d) => setDrome(d))
  }, [])

  useEffect(() => {
    console.log(drome)
  }, [drome])

  return <h1>{drome ? 'Ready' : 'Loading...'}</h1>
}
