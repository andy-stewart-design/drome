import {
  createContext,
  useContext,
  createSignal,
  type Accessor,
  type ParentProps,
} from 'solid-js'
import { useDrome } from './drome'
import { parseColorCssVars } from '@/utils/parse-color-css-var'

type ThemeOption = 'dark' | 'light'

// Create context with undefined as default
const ThemeContext = createContext<ThemeContextType>()

// Define the context type
type ThemeContextType = {
  colorScheme: Accessor<ThemeOption>
  setColorScheme(theme?: ThemeOption): void
}

// Provider component
function ThemeProvider(props: ParentProps) {
  const [colorScheme, setColorScheme] = createSignal<ThemeOption>('dark')
  const { visualizer } = useDrome()

  function handleSetColorTheme(scheme?: ThemeOption) {
    const next = (scheme ?? colorScheme() === 'light') ? 'dark' : 'light'
    setColorScheme(next)
    setVisualizerColorScheme(next)
  }

  function setVisualizerColorScheme(scheme: ThemeOption) {
    const viz = visualizer()
    const bgVar = `--app-color-neutral-${scheme === 'dark' ? 950 : 50}-lch`
    const fgVar = `--app-color-magenta-${scheme === 'dark' ? 300 : 400}-lch`
    const [fgLCH, bgLCH] = parseColorCssVars(fgVar, bgVar)

    if (!viz || !bgLCH || !fgLCH) return

    viz.bgLCH(bgLCH)
    viz.fgLCH(fgLCH)
  }

  const contextValue = {
    colorScheme,
    setColorScheme: handleSetColorTheme,
  } satisfies ThemeContextType

  return (
    <ThemeContext.Provider value={contextValue}>
      {props.children}
    </ThemeContext.Provider>
  )
}

// Typesafe hook that throws if used outside provider
function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeProvider
export { ThemeProvider, useTheme }
