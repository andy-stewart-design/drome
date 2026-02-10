import { type ParentComponent } from 'solid-js'
import { PlayStateProvider } from './playstate'

const Providers: ParentComponent = (props) => {
  return <PlayStateProvider>{props.children}</PlayStateProvider>
}

export default Providers
