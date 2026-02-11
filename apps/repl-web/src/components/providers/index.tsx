import { type ParentComponent } from 'solid-js'
import { PlayStateProvider } from './playstate'
import SidebarProvider from './sidebar'
import SessionProvider from './session'
import UserProvider from './user'
import EditorProvider from './editor'
import DromeProvider from './drome'

const Providers: ParentComponent = (props) => {
  return (
    <SessionProvider>
      <UserProvider>
        <EditorProvider>
          <SidebarProvider>
            <PlayStateProvider>
              <DromeProvider>{props.children}</DromeProvider>
            </PlayStateProvider>
          </SidebarProvider>
        </EditorProvider>
      </UserProvider>
    </SessionProvider>
  )
}

export default Providers
