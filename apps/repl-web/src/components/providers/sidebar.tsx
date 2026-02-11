import {
  createContext,
  useContext,
  createSignal,
  type Accessor,
  type ParentProps,
  type Setter,
} from 'solid-js'

// Define the context type
type SidebarContextType = {
  showSidebar: Accessor<boolean>
  setShowSidebar: Setter<boolean>
  sidebarSize: Accessor<number>
  setSidebarSize: Setter<number>
}

// Create context with undefined as default
const SidebarContext = createContext<SidebarContextType>()

// Provider component
function SidebarProvider(props: ParentProps) {
  const [showSidebar, setShowSidebar] = createSignal(true)
  const [sidebarSize, setSidebarSize] = createSignal(360)

  const contextValue = {
    showSidebar,
    setShowSidebar,
    sidebarSize,
    setSidebarSize,
  } satisfies SidebarContextType

  return (
    <SidebarContext.Provider value={contextValue}>
      {props.children}
    </SidebarContext.Provider>
  )
}

// Typesafe hook that throws if used outside provider
function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

export default SidebarProvider
export { SidebarProvider, useSidebar }
