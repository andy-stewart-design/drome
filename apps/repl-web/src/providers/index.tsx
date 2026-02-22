import DromeProvider from './drome'
import EditorProvider from './editor'
import PlayStateProvider from './playstate'
import SidebarProvider from './sidebar'
import SessionProvider from './session'
import ThemeProvider from './theme'
import UserProvider from './user'
import type { ParentComponent } from 'solid-js'

const Providers: ParentComponent = (props) => {
  return (
    <UserProvider>
      <SessionProvider>
        <EditorProvider>
          <SidebarProvider>
            <PlayStateProvider>
              <DromeProvider>
                <ThemeProvider>{props.children}</ThemeProvider>
              </DromeProvider>
            </PlayStateProvider>
          </SidebarProvider>
        </EditorProvider>
      </SessionProvider>
    </UserProvider>
  )
}

export default Providers
