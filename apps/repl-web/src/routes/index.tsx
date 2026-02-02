import { createFileRoute } from '@tanstack/solid-router'

import Drome from 'drome-live'
import { createSignal, onMount } from 'solid-js'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [drome, setDrome] = createSignal<Drome | null>(null)

  onMount(async () => {
    const d = await Drome.init(120)
    setDrome(d)
    console.log(drome)
  })

  return (
    <div>
      <h1>Hello!</h1>
    </div>
  )
}
