import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

let baseTheme = EditorView.theme(
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

const highlightStyles = HighlightStyle.define([
  {
    tag: [tags.keyword],
    color: '#5e81ac',
  },
  {
    tag: [tags.function(tags.variableName)],
    color: '#5e81ac',
  },
  {
    tag: [tags.variableName],
    color: '#d08770',
  },
  {
    tag: [tags.brace],
    color: '#8fbcbb',
  },
  {
    tag: [tags.annotation],
    color: '#d30102',
  },
  {
    tag: [tags.typeName],
    color: '#ebcb8b',
  },
  {
    tag: [tags.className],
    color: '#ebcb8b',
  },
  {
    tag: [tags.operator, tags.operatorKeyword],
    color: '#a3be8c',
  },
  {
    tag: [tags.squareBracket],
    color: '#8fbcbb',
  },
  {
    tag: [tags.angleBracket],
    color: '#8fbcbb',
  },
])

const theme = [baseTheme, syntaxHighlighting(highlightStyles)]

export { theme }
