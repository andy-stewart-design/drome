import { type ParentComponent } from 'solid-js'
import { PlayStateProvider } from './playstate'
import SidebarProvider from './sidebar'
import SessionProvider from './session'
import UserProvider from './user'
import EditorProvider from './editor'

const Providers: ParentComponent = (props) => {
  return (
    <SessionProvider>
      <UserProvider>
        <EditorProvider>
          <SidebarProvider>
            <PlayStateProvider>{props.children}</PlayStateProvider>
          </SidebarProvider>
        </EditorProvider>
      </UserProvider>
    </SessionProvider>
  )
}

export default Providers
