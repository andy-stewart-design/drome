import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, For, onCleanup, onMount, type Setter } from 'solid-js'
import type { EditorView } from 'codemirror'
import type Drome from 'drome-live'
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator'

import CodeMirror from '@/components/CodeMirror'
import { flash } from '@/codemirror/flash'
import {
  addSketch,
  updateSketch,
  getSketches,
  deleteSketch,
  // workingSketchSchema,
  type SavedSketch,
  type WorkingSketch,
} from '@/utils/indexdb'
import { userSchema, type DromeUser } from '@/utils/user'

export const Route = createFileRoute('/')({ component: App })
// const LS_WORKING_SKETCH_KEY = 'drome_sketch'
const LS_USER_KEY = 'drome_user'

function App() {
  const [drome, setDrome] = createSignal<Drome | undefined>(undefined)
  const [editor, setEditor] = createSignal<EditorView | undefined>(undefined)
  const [workingSketch, setWorkingSketch] =
    createSignal<WorkingSketch>(createSketch())
  const [savedSketches, setSavedSketches] = createSignal<SavedSketch[]>([])
  const controller = new AbortController()

  onMount(() => {
    import('drome-live')
      .then(({ default: Drome }) => Drome.init(120))
      .then((d) => setDrome(d))

    getSketches().then((sketches) => {
      if (sketches) setSavedSketches(sketches)
      const sketch = loadLatestWorkingSketch(sketches)
      setWorkingSketch(sketch)
    })

    // console.log(getUserData())
    const { signal } = controller

    const handleKeyDown = (e: KeyboardEvent) =>
      onKeyDown(e, workingSketch(), setWorkingSketch, drome(), editor())

    const handleUnload = (e: Event) =>
      beforeClose(workingSketch(), savedSketches(), e)

    window.addEventListener('keydown', handleKeyDown, { signal })
    window.addEventListener('beforeunload', handleUnload, { signal })
  })

  onCleanup(() => {
    drome()?.destroy()
    editor()?.destroy()
    controller.abort()
  })

  return (
    <div
      style={{
        display: 'grid',
        'grid-template-columns': 'minmax(0,1fr) var(--app-sidebar-width)',
      }}
    >
      <CodeMirror editor={editor} sketch={workingSketch} onLoad={setEditor} />
      <div>
        <button
          onClick={async () => {
            const ed = editor()
            if (!ed) return
            const result = await saveWorkingSketch({
              ...workingSketch(),
              code: ed.state.doc.toString(),
            })
            if (result.success) {
              setWorkingSketch(result.data)
              const sketches = await getSketches()
              if (sketches) setSavedSketches(sketches)
            }
          }}
        >
          Save
        </button>
        <ul style={{ padding: 0, 'list-style': 'none' }}>
          <For each={savedSketches()}>
            {(item) => (
              <li style={{ display: 'flex' }}>
                <div>
                  <p>
                    <span style={{ 'font-size': '13px' }}>{item.title}</span>
                    <span style={{ 'font-size': '13px', opacity: 0.6 }}>
                      {item.author}
                    </span>
                  </p>
                </div>
                <button
                  onClick={async () => {
                    deleteSketch(item.id)
                    const sketches = await getSketches()
                    if (sketches) setSavedSketches(sketches)
                  }}
                >
                  ✕
                </button>
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  )
}

function runCode(drome: Drome, code: string) {
  // const msg = drome.paused ? `◑ Evaluating code...` : `◑ Queuing update...`
  // console.log(msg, 'input')

  try {
    const result = new Function('drome, d', `${code}`)(drome, drome)

    // console.log(`✓ Code executed successfully`, 'output')
    if (result !== undefined) {
      console.log(`← ${result}`, 'output')
    }
  } catch (error) {
    console.log(`✗ ${(error as Error).message}`, 'error')
  }
}

function onKeyDown(
  e: KeyboardEvent,
  sketch: WorkingSketch,
  setSketch: Setter<WorkingSketch>,
  drome?: Drome,
  editor?: EditorView,
) {
  if (!drome || !editor) return

  if (e.altKey && e.key === 'Enter') {
    e.preventDefault()
    const code = editor.state.doc.toString()
    runCode(drome, code)
    setSketch((s) => ({ ...s, code }))
    flash(editor)
    if (drome.paused) drome.start()

    // localStorage.setItem(LS_KEY, editor.state.doc.toString())
    // saveWorkingSketchLS({ ...sketch, code: editor.state.doc.toString() })
  } else if (e.altKey && e.key === '≥') {
    e.preventDefault()
    drome.stop()
  }
}

function beforeClose(working: WorkingSketch, saved: SavedSketch[], e: Event) {
  if (!('id' in working)) {
    e.preventDefault()
    return
  }

  const savedSketch = saved.find((saved) => saved.id === working.id)
  if (savedSketch?.code !== working.code) {
    e.preventDefault()
  }
}

// function saveWorkingSketchLS(workingSketch: WorkingSketch) {
//   localStorage.setItem(LS_WORKING_SKETCH_KEY, JSON.stringify(workingSketch))
// }

async function saveWorkingSketch(sketch: WorkingSketch) {
  let res: Awaited<ReturnType<typeof updateSketch>>

  if ('id' in sketch) {
    res = await updateSketch({ ...sketch, updatedAt: new Date().toISOString() })
  } else {
    res = await addSketch(sketch)
  }

  // if (res.success) saveWorkingSketchLS(res.data)

  return res
}

function loadLatestWorkingSketch(
  sketches: SavedSketch[] | null,
): WorkingSketch {
  if (!sketches) return createSketch()
  return getMostRecentSketch(sketches)
  // const sketch = localStorage.getItem(LS_WORKING_SKETCH_KEY)
  // if (!sketch) return createSketch()
  // const parsed = workingSketchSchema.safeParse(JSON.parse(sketch))
  // if (!parsed.success) return createSketch()
  // return parsed.data
}

function createSketch({
  code,
  title,
  author,
}: { code?: string; title?: string; author?: string } = {}): WorkingSketch {
  const t =
    title ??
    uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: ' ',
      style: 'capital',
    })
  const randomAnimal = uniqueNamesGenerator({
    dictionaries: [animals],
    style: 'capital',
  })
  const a = author ?? `Anonymous ${randomAnimal}`
  const c = code ?? 'd.synth("sine").note(60).push()'

  return {
    title: t,
    author: a,
    code: c,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function getMostRecentSketch(sketches: SavedSketch[]) {
  return sketches.reduce((latest, current) =>
    new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest,
  )
}

function sortSketches(sketches: SavedSketch[]) {
  // TODO: Replace with Array.toSorted
  return [...sketches].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

function getUserData() {
  const user = localStorage.getItem(LS_USER_KEY)
  if (!user) return createUser()

  const parsed = userSchema.safeParse(JSON.parse(user))
  if (!parsed.success) return createUser()

  return parsed.data
}

function createUser() {
  const randomAnimal = uniqueNamesGenerator({
    dictionaries: [animals],
    separator: ' ',
    style: 'capital',
  })

  const user: DromeUser = {
    name: `Anonymous ${randomAnimal}`,
    id: crypto.randomUUID(),
  }

  localStorage.setItem(LS_USER_KEY, JSON.stringify(user))
  return user
}
