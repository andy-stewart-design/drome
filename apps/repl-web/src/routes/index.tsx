import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, type KeyboardEvent } from 'react'
import Drome from 'drome-live'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [drome, setDrome] = useState<Drome | null>(null)

  useEffect(() => {
    Drome.init(120).then((d) => setDrome(d))
  }, [])

  function onkeyDown(e: KeyboardEvent) {
    console.log(e.key)

    if (!(e.target instanceof HTMLTextAreaElement) || !drome) return
    if (e.altKey && e.key === 'Enter') {
      e.preventDefault()
      console.log(e.target.value)
      runCode(drome, e.target.value)
      if (drome.paused) {
        drome.start()
      }
    } else if (e.altKey && e.key === '≥') {
      e.preventDefault()
      drome.stop()
      drome.clear()
    }
  }

  return (
    <main>
      <textarea
        name="code"
        defaultValue='d.sample("bd:3").bank("tr909").euclid([3, 5], 8)'
        onKeyDown={onkeyDown}
        spellCheck={false}
        disabled={!drome}
      />
    </main>
  )
}

function runCode(drome: Drome, code: string) {
  const msg = drome.paused ? `◑ Evaluating code...` : `◑ Queuing update...`
  console.log(msg, 'input')

  try {
    drome.clear()
    const result = new Function('drome, d', `${code}`)(drome, drome)

    console.log(`✓ Code executed successfully`, 'output')
    if (result !== undefined) {
      console.log(`← ${result}`, 'output')
    }
  } catch (error) {
    console.log(`✗ ${(error as Error).message}`, 'error')
  }
}
