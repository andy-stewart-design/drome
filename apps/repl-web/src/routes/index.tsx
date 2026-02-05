import { createFileRoute } from '@tanstack/solid-router'
import { createSignal, For, onCleanup, onMount } from 'solid-js'
import type { EditorView } from 'codemirror'
import type Drome from 'drome-live'

import CodeMirror from '@/components/CodeMirror'
import { flash } from '@/codemirror/flash'
import {
  addSketch,
  updateSketch,
  getSketches,
  workingSketchSchema,
  type SavedSketch,
  type RawSketch,
  type WorkingSketch,
} from '@/utils/indexdb'

export const Route = createFileRoute('/')({ component: App })
const LS_KEY = 'drome_sketch'

function App() {
  const [drome, setDrome] = createSignal<Drome | undefined>(undefined)
  const [editor, setEditor] = createSignal<EditorView | undefined>(undefined)
  const [workingSketch, setWorkingSketch] =
    createSignal<WorkingSketch>(createSketch())
  const [savedSketches, setSavedSketches] = createSignal<SavedSketch[]>([])
  const controller = new AbortController()

  onMount(async () => {
    import('drome-live')
      .then(({ default: Drome }) => Drome.init(120))
      .then((d) => setDrome(d))

    const sketches = await getSketches()
    if (sketches) setSavedSketches(sketches)

    const sketch = loadLatestWorkingSketch()
    setWorkingSketch(sketch)

    const { signal } = controller
    const handleKeyDown = (e: KeyboardEvent) =>
      onKeyDown(e, workingSketch(), drome(), editor())
    window.addEventListener('keydown', handleKeyDown, { signal })
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
            saveWorkingSketch(workingSketch())
            const sketches = await getSketches()
            if (sketches) setSavedSketches(sketches)
          }}
        >
          Save
        </button>
        <ul>
          <For each={savedSketches()}>{(item) => <li>{item.title}</li>}</For>
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
  drome?: Drome,
  editor?: EditorView,
) {
  if (!drome || !editor) return

  if (e.altKey && e.key === 'Enter') {
    e.preventDefault()
    const code = editor.state.doc.toString()
    runCode(drome, code)
    flash(editor)
    if (drome.paused) drome.start()

    // localStorage.setItem(LS_KEY, editor.state.doc.toString())
    saveWorkingSketchLS(sketch, editor)
  } else if (e.altKey && e.key === '≥') {
    e.preventDefault()
    drome.stop()
  }
}

function saveWorkingSketchLS(workingSketch: WorkingSketch, editor: EditorView) {
  if (!editor) return

  localStorage.setItem(
    LS_KEY,
    JSON.stringify({ ...workingSketch, code: editor.state.doc.toString() }),
  )
}

function saveWorkingSketch(sketch: WorkingSketch) {
  if ('id' in sketch) {
    updateSketch(sketch)
  } else {
    addSketch(sketch)
  }
}

function loadLatestWorkingSketch(): WorkingSketch {
  const sketch = localStorage.getItem(LS_KEY)

  if (!sketch) {
    return createSketch()
  }

  const parsed = workingSketchSchema.safeParse(JSON.parse(sketch))

  if (!parsed.success) {
    return createSketch()
  }

  return parsed.data
}

function createSketch(title = '', author = '', code = ''): WorkingSketch {
  return {
    title,
    author,
    code,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}
