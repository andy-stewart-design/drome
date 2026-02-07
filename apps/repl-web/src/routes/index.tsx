import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, onCleanup, onMount, type Setter } from 'solid-js'
import type { EditorView } from 'codemirror'
import type Drome from 'drome-live'
import { uniqueNamesGenerator, animals } from 'unique-names-generator'

import CodeMirror from '@/components/CodeMirror'
import { flash } from '@/codemirror/flash'
import {
  createSketch,
  deleteSketch,
  getSketches,
  getLatestSketch,
  saveSketch,
  type SavedSketch,
  type WorkingSketch,
} from '@/utils/sketch-db'
import { userSchema, type DromeUser } from '@/utils/user'
import SketchMetadata from '@/components/SketchMetadata'
import SketchManager from '@/components/SketchManager'
import SidebarResizer from '@/components/SidebarResizer'
import EditorHeader from '@/components/EditorHeader'
import EditorToolbar from '@/components/EditorToolbar'

export const Route = createFileRoute('/')({ component: App })
const LS_USER_KEY = 'drome_user'

function App() {
  const [drome, setDrome] = createSignal<Drome | undefined>(undefined)
  const [editor, setEditor] = createSignal<EditorView | undefined>(undefined)
  const [user, setUser] = createSignal<DromeUser>(createUser())
  const [workingSketch, setWorkingSketch] =
    createSignal<WorkingSketch>(createSketch())
  const [savedSketches, setSavedSketches] = createSignal<SavedSketch[]>([])

  const [showSidebar, setShowSidebar] = createSignal(true)
  const [sidebarSize, setSidebarSize] = createSignal(360)

  const controller = new AbortController()

  onMount(() => {
    import('drome-live')
      .then(({ default: Drome }) => Drome.init(120))
      .then((d) => setDrome(d))

    getSketches().then((sketches) => {
      if (sketches) setSavedSketches(sketches)
      const sketch = getLatestSketch(sketches)
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
        'grid-template-columns': `minmax(0,1fr) ${showSidebar() ? sidebarSize() : 0}px`,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100dvh',
          display: 'flex',
          'flex-direction': 'column',
        }}
      >
        <EditorHeader>
          <SketchMetadata sketch={workingSketch} />
          <EditorToolbar onToggleSidebar={() => setShowSidebar((c) => !c)} />
        </EditorHeader>
        <CodeMirror editor={editor} sketch={workingSketch} onLoad={setEditor} />
      </div>
      <div
        style={{
          display: showSidebar() ? 'block' : 'none',
          position: 'relative',
          overflow: 'auto',
          'overscroll-behavior': 'contain',
          'border-inline-start': '1px solid rgb(255 255 255 / 0.15);',
        }}
      >
        <SketchManager
          sketches={savedSketches}
          currentSketch={workingSketch}
          onCreateNew={() => {
            setWorkingSketch(createSketch({ author: user().name }))
          }}
          onSave={async () => {
            const ed = editor()
            if (!ed) return
            const result = await saveSketch({
              ...workingSketch(),
              code: ed.state.doc.toString(),
            })
            if (result.success) {
              setWorkingSketch(result.data)
              const sketches = await getSketches()
              if (sketches) setSavedSketches(sketches)
            }
          }}
          onReplace={(item) => {
            setWorkingSketch(item)
          }}
          onDelete={async (id) => {
            deleteSketch(id)
            const sketches = await getSketches()
            if (sketches) setSavedSketches(sketches)
          }}
        />
        <SidebarResizer onResize={(n) => setSidebarSize(n)} />
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
