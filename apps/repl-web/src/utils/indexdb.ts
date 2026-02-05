import { z } from 'zod'

const DATABASE_NAME = 'dromeSketchDB'
const STORE_NAME = 'sketches'
const DB_VERSION = 1

const rawSketchSchema = z.object({
  code: z.string(),
  author: z.string(),
  title: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const savedSketchSchema = rawSketchSchema.extend({
  id: z.number(),
})

const workingSketchSchema = rawSketchSchema.extend({
  id: z.number().optional(),
})

const savedSketchesSchema = z.array(savedSketchSchema)

type RawSketch = z.infer<typeof rawSketchSchema>
type SavedSketch = z.infer<typeof savedSketchSchema>
type WorkingSketch = RawSketch | SavedSketch
type TransactionType = 'readonly' | 'readwrite'

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

type IDBReturnValue =
  | { success: true; data: any }
  | { success: false; error: string }

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

  return parsed.data
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

const addSketch = async (sketch: RawSketch) => {
  const store = await getStore('readwrite')

  return new Promise<DOMException | null>((resolve) => {
    const request = store.add(sketch)
    request.onsuccess = () => resolve(null)
    request.onerror = () => resolve(request.error)
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

const updateSketch = async (updatedTodo: SavedSketch) => {
  const store = await getStore('readwrite')

  return new Promise<DOMException | null>((resolve) => {
    const request = store.put(updatedTodo)
    request.onsuccess = () => resolve(null)
    request.onerror = () => resolve(request.error)
  })
}

export {
  addSketch,
  deleteSketch,
  getSketch,
  getSketches,
  updateSketch,
  workingSketchSchema,
  type RawSketch,
  type SavedSketch,
  type WorkingSketch,
}
