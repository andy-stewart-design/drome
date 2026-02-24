import {
  createContext,
  useContext,
  createSignal,
  createUniqueId,
  type JSX,
  type ParentProps,
  type Accessor,
  Show,
} from 'solid-js'

type TabId = string

interface TabsContextValue {
  activeTab: Accessor<TabId | null>
  setActiveTab: (id: TabId) => void
  registerTab: (id: TabId) => void
  getTabId: (id: TabId) => string
  getPanelId: (id: TabId) => string
  focusNextTab: (currentId: TabId) => void
  focusPrevTab: (currentId: TabId) => void
  focusFirstTab: () => void
  focusLastTab: () => void
}

const TabsContext = createContext<TabsContextValue>()

function useTabs(): TabsContextValue {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tab components must be used within a <Tabs> provider')
  }
  return context
}

interface TabsProps extends ParentProps {
  defaultTab?: TabId
  keyboardActivation?: 'automatic' | 'manual'
}

function Tabs(props: TabsProps): JSX.Element {
  const [activeTab, setActiveTab] = createSignal<TabId | null>(
    props.defaultTab || null,
  )
  const [tabs, setTabs] = createSignal<TabId[]>([])
  const baseId = createUniqueId()
  const keyboardActivation = props.keyboardActivation ?? 'automatic'

  const registerTab = (id: TabId): void => {
    setTabs((prev) => {
      if (!prev.includes(id)) {
        const newTabs = [...prev, id]
        if (activeTab() === null) {
          setActiveTab(id)
        }
        return newTabs
      }
      return prev
    })
  }

  const getTabId = (id: TabId): string => `${baseId}-tab-${id}`
  const getPanelId = (id: TabId): string => `${baseId}-panel-${id}`

  const focusTab = (id: TabId): void => {
    const tabElement = document.getElementById(getTabId(id))
    tabElement?.focus()
  }

  const focusNextTab = (currentId: TabId): void => {
    const tabList = tabs()
    const currentIndex = tabList.indexOf(currentId)
    const nextIndex = (currentIndex + 1) % tabList.length
    focusTab(tabList[nextIndex])

    if (keyboardActivation === 'automatic') {
      setActiveTab(tabList[nextIndex])
    }
  }

  const focusPrevTab = (currentId: TabId): void => {
    const tabList = tabs()
    const currentIndex = tabList.indexOf(currentId)
    const prevIndex = (currentIndex - 1 + tabList.length) % tabList.length
    focusTab(tabList[prevIndex])

    if (keyboardActivation === 'automatic') {
      setActiveTab(tabList[prevIndex])
    }
  }

  const focusFirstTab = (): void => {
    const tabList = tabs()
    if (tabList.length > 0) {
      focusTab(tabList[0])

      if (keyboardActivation === 'automatic') {
        setActiveTab(tabList[0])
      }
    }
  }

  const focusLastTab = (): void => {
    const tabList = tabs()
    if (tabList.length > 0) {
      focusTab(tabList[tabList.length - 1])

      if (keyboardActivation === 'automatic') {
        setActiveTab(tabList[tabList.length - 1])
      }
    }
  }

  const context: TabsContextValue = {
    activeTab,
    setActiveTab,
    registerTab,
    getTabId,
    getPanelId,
    focusNextTab,
    focusPrevTab,
    focusFirstTab,
    focusLastTab,
  }

  return (
    <TabsContext.Provider value={context}>
      <div>{props.children}</div>
    </TabsContext.Provider>
  )
}

interface TabListProps extends JSX.HTMLAttributes<HTMLDivElement> {
  'aria-label': string
}

function TabList(props: TabListProps): JSX.Element {
  return (
    <div {...props} role="tablist" aria-label={props['aria-label']}>
      {props.children}
    </div>
  )
}

interface TabProps extends JSX.HTMLAttributes<HTMLButtonElement> {
  id: TabId
}

function Tab(props: TabProps): JSX.Element {
  const {
    activeTab,
    setActiveTab,
    registerTab,
    getTabId,
    getPanelId,
    focusNextTab,
    focusPrevTab,
    focusFirstTab,
    focusLastTab,
  } = useTabs()

  registerTab(props.id)

  const isSelected = (): boolean => activeTab() === props.id

  const handleClick = (): void => {
    setActiveTab(props.id)
  }

  const handleKeyDown = (e: KeyboardEvent): void => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        focusNextTab(props.id)
        break
      case 'ArrowLeft':
        e.preventDefault()
        focusPrevTab(props.id)
        break
      case 'Home':
        e.preventDefault()
        focusFirstTab()
        break
      case 'End':
        e.preventDefault()
        focusLastTab()
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        setActiveTab(props.id)
        break
    }
  }

  return (
    <button
      {...props}
      role="tab"
      id={getTabId(props.id)}
      aria-selected={isSelected()}
      aria-controls={getPanelId(props.id)}
      tabIndex={isSelected() ? 0 : -1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {props.children}
    </button>
  )
}

interface TabPanelsProps extends ParentProps {}

function TabPanels(props: TabPanelsProps): JSX.Element {
  return <div>{props.children}</div>
}

interface TabPanelProps extends ParentProps {
  id: TabId
}

function TabPanel(props: TabPanelProps): JSX.Element {
  const { activeTab, getTabId, getPanelId } = useTabs()

  const isActive = (): boolean => activeTab() === props.id

  // if (!isActive) return null

  return (
    <div
      role="tabpanel"
      id={getPanelId(props.id)}
      aria-labelledby={getTabId(props.id)}
      hidden={!isActive()}
      // tabIndex={0}
    >
      <Show when={isActive()}>{props.children}</Show>
    </div>
  )
}

export {
  Tabs,
  TabList,
  TabList as List,
  Tab,
  TabPanels,
  TabPanels as Panels,
  TabPanel,
  TabPanel as Panel,
  type TabsProps,
  type TabProps,
  type TabListProps,
  type TabPanelsProps,
  type TabPanelProps,
}
