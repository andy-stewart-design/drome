import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator'
import { z } from 'zod'

const DATABASE_NAME = 'dromeSketchDB'
const STORE_NAME = 'sketches'
const DB_VERSION = 1

const sketchSchema = z.object({
  code: z.string(),
  author: z.string(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const savedSketchSchema = sketchSchema.extend({
  id: z.number(),
})

const workingSketchSchema = sketchSchema.extend({
  id: z.number().optional(),
})

const savedSketchesSchema = z.array(savedSketchSchema)

type NewSketch = z.infer<typeof sketchSchema>
type SavedSketch = z.infer<typeof savedSketchSchema>
type WorkingSketch = NewSketch | SavedSketch

type TransactionType = 'readonly' | 'readwrite'

type IDBReturnValue =
  | { success: true; data: any }
  | { success: false; error: string }

type CRUDReturnValue =
  | { success: true; data: SavedSketch }
  | { success: false; error: string }

const initDB = async () => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getStore(type: TransactionType) {
  const db = await initDB()
  const transaction = db.transaction(STORE_NAME, type)
  return transaction.objectStore(STORE_NAME)
}

const getSketches = async () => {
  const store = await getStore('readonly')

  const results = await new Promise<IDBReturnValue>((resolve) => {
    const request = store.getAll()

    request.onsuccess = () => {
      resolve({ success: true, data: request.result })
    }

    request.onerror = () => {
      const error = request.error?.message ?? 'Unknown error'
      resolve({ success: false, error })
    }
  })

  if (!results.success) {
    console.error(results.error)
    return null
  }

  const parsed = savedSketchesSchema.safeParse(results.data)

  if (!parsed.success) {
    console.error(parsed.error)
    return null
  }

  return sortSketches(parsed.data)
}

const getSketch = async (id: number) => {
  const store = await getStore('readonly')

  const results = await new Promise<IDBReturnValue>((resolve) => {
    const request = store.get(id)

    request.onsuccess = () => {
      resolve({ success: true, data: request.result })
    }

    request.onerror = () => {
      const error = request.error?.message ?? 'Unknown error'
      resolve({ success: false, error })
    }
  })

  if (!results.success) {
    console.error(results.error)
    return null
  }

  const parsed = savedSketchSchema.safeParse(results.data)

  if (!parsed.success) {
    console.error(parsed.error)
    return null
  }

  return parsed.data
}

const addSketch = async (sketch: NewSketch) => {
  const store = await getStore('readwrite')

  return new Promise<CRUDReturnValue>((resolve) => {
    const request = store.add(sketch)

    request.onsuccess = () => {
      const id =
        typeof request.result === 'number'
          ? request.result
          : Number(request.result)
      resolve({ success: true, data: { ...sketch, id } })
    }

    request.onerror = () => {
      const error = request.error?.message ?? 'Unknown error'
      resolve({ success: false, error })
    }
  })
}

const updateSketch = async (sketch: SavedSketch) => {
  const store = await getStore('readwrite')

  return new Promise<CRUDReturnValue>((resolve) => {
    const request = store.put(sketch)

    request.onsuccess = () => resolve({ success: true, data: sketch })

    request.onerror = () => {
      const error = request.error?.message ?? 'Unknown error'
      resolve({ success: false, error })
    }
  })
}

const deleteSketch = async (id: number) => {
  const store = await getStore('readwrite')

  return new Promise<DOMException | null>((resolve) => {
    const request = store.delete(id)
    request.onsuccess = () => resolve(null)
    request.onerror = () => resolve(request.error)
  })
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

async function saveSketch(sketch: WorkingSketch) {
  let res: Awaited<ReturnType<typeof updateSketch>>

  if ('id' in sketch) {
    res = await updateSketch({ ...sketch, updatedAt: new Date().toISOString() })
  } else {
    res = await addSketch(sketch)
  }

  return res
}

function getLatestSketch(sketches: SavedSketch[] | null) {
  if (!sketches) return createSketch()
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

export {
  addSketch,
  createSketch,
  deleteSketch,
  getLatestSketch,
  getSketch,
  getSketches,
  saveSketch,
  updateSketch,
  workingSketchSchema,
  type NewSketch,
  type SavedSketch,
  type WorkingSketch,
}
