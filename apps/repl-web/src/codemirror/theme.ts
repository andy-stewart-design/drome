import { EditorView } from '@codemirror/view'

let theme = EditorView.theme(
  {
    '&': {
      color: 'white',
      backgroundColor: '#034',
    },
    '.cm-content': {
      caretColor: '#0e9',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#FFF',
    },
    '&.cm-focused .cm-selectionBackground, ::selection': {
      backgroundColor: '#074',
    },
    '.cm-gutters': {
      backgroundColor: 'transparent',
      color: '#888',
      borderInlineEnd: 'none',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgb(255 255 255 / 0.125)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'rgb(255 255 255 / 0.2)',
    },
  },
  { dark: true },
)

export { theme }
