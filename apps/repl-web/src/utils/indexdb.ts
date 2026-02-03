const DATABASE_NAME = 'todoDatabase'
const STORE_NAME = 'todos'
const DB_VERSION = 1

export interface CreatedTodo {
  task: string
  completed: boolean
}

export interface SavedTodo extends CreatedTodo {
  id: number
}

type TransactionType = 'readonly' | 'readwrite'

const initDB = async (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
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

export const getTodos = async (): Promise<SavedTodo[]> => {
  const store = await getStore('readonly')

  return new Promise((resolve, reject) => {
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export const addTodo = async (todo: CreatedTodo): Promise<void> => {
  const store = await getStore('readwrite')

  return new Promise((resolve, reject) => {
    const request = store.add(todo)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const deleteTodo = async (id: number): Promise<void> => {
  const store = await getStore('readwrite')

  return new Promise((resolve, reject) => {
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export const updateTodo = async (updatedTodo: SavedTodo): Promise<void> => {
  const store = await getStore('readwrite')

  return new Promise((resolve, reject) => {
    const request = store.put(updatedTodo)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
