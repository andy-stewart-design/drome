import { type ParentComponent } from 'solid-js'
import { PlayStateProvider } from './playstate'
import SidebarProvider from './sidebar'
import SessionProvider from './session'
import UserProvider from './user'

const Providers: ParentComponent = (props) => {
  return (
    <SessionProvider>
      <UserProvider>
        <SidebarProvider>
          <PlayStateProvider>{props.children}</PlayStateProvider>
        </SidebarProvider>
      </UserProvider>
    </SessionProvider>
  )
}

export default Providers
