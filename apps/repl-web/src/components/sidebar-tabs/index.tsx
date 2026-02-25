import * as BaseTabs from '@/components/tabs'
import s from './style.module.css'

function Tabs(props: BaseTabs.TabsProps) {
  return (
    <BaseTabs.Tabs {...props} class={s.tabs}>
      {props.children}
    </BaseTabs.Tabs>
  )
}

function TabList(props: BaseTabs.TabListProps) {
  return (
    <BaseTabs.TabList {...props} class={s.tablist}>
      {props.children}
    </BaseTabs.TabList>
  )
}

function Tab(props: BaseTabs.TabProps) {
  return (
    <BaseTabs.Tab {...props} class={s.tab}>
      <span>{props.children}</span>
    </BaseTabs.Tab>
  )
}

function TabPanels(props: BaseTabs.TabPanelsProps) {
  return (
    <BaseTabs.TabPanels class={s.panels}>{props.children}</BaseTabs.TabPanels>
  )
}

function TabPanel(props: BaseTabs.TabPanelProps) {
  return <BaseTabs.TabPanel {...props}>{props.children}</BaseTabs.TabPanel>
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
}
