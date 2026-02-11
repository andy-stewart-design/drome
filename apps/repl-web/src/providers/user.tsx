import {
  createContext,
  useContext,
  createSignal,
  onMount,
  type Accessor,
  type ParentProps,
  type Setter,
} from 'solid-js'
import { uniqueNamesGenerator, animals } from 'unique-names-generator'
import { userSchema, type DromeUser } from '@/utils/user'

// Define the context type
type UserContextType = {
  user: Accessor<DromeUser>
  setUser: Setter<DromeUser>
}

const LS_USER_KEY = 'drome_user'

// Create context with undefined as default
const UserContext = createContext<UserContextType>()

// Provider component
function UserProvider(props: ParentProps) {
  const [user, setUser] = createSignal<DromeUser>(createUser())

  onMount(() => {
    const cachedUser = getUserData()
    if (cachedUser) {
      setUser(cachedUser)
      // localStorage.setItem(LS_USER_KEY, JSON.stringify(cachedUser))
    } else {
      localStorage.setItem(LS_USER_KEY, JSON.stringify(user()))
    }
  })

  const contextValue = { user, setUser } satisfies UserContextType

  return (
    <UserContext.Provider value={contextValue}>
      {props.children}
    </UserContext.Provider>
  )
}

// Typesafe hook that throws if used outside provider
function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export default UserProvider
export { UserProvider, useUser }

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
