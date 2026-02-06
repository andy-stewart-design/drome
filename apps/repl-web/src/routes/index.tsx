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
  type SavedSketch,
  type WorkingSketch,
} from '@/utils/indexdb'
import { userSchema, type DromeUser } from '@/utils/user'

export const Route = createFileRoute('/')({ component: App })
const LS_USER_KEY = 'drome_user'

function App() {
  const [drome, setDrome] = createSignal<Drome | undefined>(undefined)
  const [editor, setEditor] = createSignal<EditorView | undefined>(undefined)
  const [user, setUser] = createSignal<DromeUser>(createUser())
  const [workingSketch, setWorkingSketch] =
    createSignal<WorkingSketch>(createSketch())
  const [savedSketches, setSavedSketches] = createSignal<SavedSketch[]>([])
  const controller = new AbortController()

  onMount(() => {
    import('drome-live')
      .then(({ default: Drome }) => Drome.init(120))
      .then((d) => setDrome(d))

    getSketches().then((sketches) => {
      if (sketches) setSavedSketches(sortSketches(sketches))
      const sketch = loadLatestWorkingSketch(sketches)
      setWorkingSketch(sketch)
    })

    const cachedUser = getUserData()
    if (cachedUser) {
      setUser(cachedUser)
      localStorage.setItem(LS_USER_KEY, JSON.stringify(cachedUser))
    } else {
      localStorage.setItem(LS_USER_KEY, JSON.stringify(user()))
    }

    const { signal } = controller

    const handleKeyDown = (e: KeyboardEvent) =>
      onKeyDown(e, setWorkingSketch, drome(), editor())

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
      <div
        style={{
          // border: '2px solid red',
          width: '100%',
          height: '100dvh',
          display: 'flex',
          'flex-direction': 'column',
        }}
      >
        <details>
          <summary>sketch metadata</summary>
          <p>Title: {workingSketch().title}</p>
          <p>Author: {workingSketch().author}</p>
          <p>Last Saved: {workingSketch().updatedAt}</p>
        </details>
        <CodeMirror editor={editor} sketch={workingSketch} onLoad={setEditor} />
      </div>
      <div style={{ overflow: 'auto', 'overscroll-behavior': 'contain' }}>
        <button
          onClick={() => {
            setWorkingSketch(createSketch({ author: user().name }))
          }}
        >
          New
        </button>
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
              if (sketches) setSavedSketches(sortSketches(sketches))
            }
          }}
        >
          Save
        </button>

        <ul style={{ padding: 0, margin: 0, 'list-style': 'none' }}>
          <For each={savedSketches()}>
            {(item) => (
              <li style={{ display: 'flex' }}>
                <div>
                  <p style={{ margin: 0 }}>
                    <button
                      style={{ 'font-size': '13px' }}
                      onClick={() => {
                        setWorkingSketch(item)
                      }}
                    >
                      {item.title}
                    </button>
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
    // <div
    //   style={{
    //     display: 'grid',
    //     'grid-template-columns': 'minmax(0,1fr) var(--app-sidebar-width)',
    //   }}
    // >
    //   <div>
    //     <details>
    //       <summary>sketch metadata</summary>
    //       <p>Title: {workingSketch().title}</p>
    //       <p>Author: {workingSketch().author}</p>
    //       <p>Last Saved: {workingSketch().updatedAt}</p>
    //     </details>
    //     <CodeMirror editor={editor} sketch={workingSketch} onLoad={setEditor} />
    //   </div>

    // </div>
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

async function saveWorkingSketch(sketch: WorkingSketch) {
  let res: Awaited<ReturnType<typeof updateSketch>>

  if ('id' in sketch) {
    res = await updateSketch({ ...sketch, updatedAt: new Date().toISOString() })
  } else {
    res = await addSketch(sketch)
  }

  return res
}

function loadLatestWorkingSketch(
  sketches: SavedSketch[] | null,
): WorkingSketch {
  if (!sketches) return createSketch()
  return getMostRecentSketch(sketches)
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
  const c = code ?? ''

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
  if (!user) return null

  const parsed = userSchema.safeParse(JSON.parse(user))
  if (!parsed.success) return null

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

  return user
}
