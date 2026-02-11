import { type ParentComponent } from 'solid-js'
import { PlayStateProvider } from './playstate'
import SidebarProvider from './sidebar'

const Providers: ParentComponent = (props) => {
  return (
    <SidebarProvider>
      <PlayStateProvider>{props.children}</PlayStateProvider>
    </SidebarProvider>
  )
}

export default Providers
