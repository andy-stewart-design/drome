import { type ParentComponent } from 'solid-js'
import { PlayStateProvider } from './playstate'
import SidebarProvider from './sidebar'
import SessionProvider from './session'

const Providers: ParentComponent = (props) => {
  return (
    <SessionProvider>
      <SidebarProvider>
        <PlayStateProvider>{props.children}</PlayStateProvider>
      </SidebarProvider>
    </SessionProvider>
  )
}

export default Providers
