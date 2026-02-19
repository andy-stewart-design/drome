import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

const ALLOW_FOLD = false

const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--color-cm-background)',
    color: 'var(--color-cm-text)',
  },
  '.cm-content': {
    caretColor: 'var(--color-cm-caret)',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--color-cm-caret)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--color-cm-gutter-bg)',
    color: 'var(--color-cm-gutter-fg)',
    borderRight: '1px solid var(--color-cm-gutter-border)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--color-cm-active-line-gutter-bg)',
    color: 'var(--color-cm-active-line-gutter-fg)',
  },
  '& .cm-line': {
    backgroundColor: 'var(--color-cm-line-bg)',
    inlineSize: 'var(--cm-line-inline-size)',
  },
  '& .cm-line.cm-activeLine': {
    backgroundColor: 'var(--color-cm-active-line-bg)',
  },
  '.cm-selectionBackground, &.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground':
    {
      backgroundColor: 'var(--color-cm-selection-bg)',
      borderRadius: '1px',
      outline: '4px solid var(--color-cm-selection-bg)',
    },
  '& .cm-line .cm-matchingBracket, & .cm-line .cm-nonmatchingBracket': {
    outline: 'none',
  },
  '& .cm-line .cm-matchingBracket': {
    backgroundColor: 'var(--color-cm-matching-bracket-bg)',
  },
  '& .cm-line .cm-matchingBracket > span': {
    color: 'var(--color-cm-matching-bracket-fg)',
  },
  '& .cm-line .cm-nonmatchingBracket': {
    backgroundColor: 'var(--color-cm-nonmatching-bracket-bg)',
  },
  '& .cm-line .cm-nonmatchingBracket > span': {
    color: 'var(--color-cm-nonmatching-bracket-fg)',
  },
  '& .cm-line .cm-selectionMatch': {
    backgroundColor: 'var(--color-cm-selection-match-bg)',
  },
  '& .cm-line .cm-selectionMatch > span': {
    color: 'var(--color-cm-selection-match-fg)',
  },
  '& .cm-gutters > .cm-gutter.cm-lineNumbers': {
    color: 'var(--color-cm-line-numbers, coral)',
  },
  '& .cm-gutters > .cm-gutter.cm-foldGutter': {
    pointerEvents: ALLOW_FOLD ? 'auto' : 'none',
    width: '4px',
  },
  '& .cm-gutters > .cm-gutter.cm-foldGutter > .cm-gutterElement > span': {
    visibility: ALLOW_FOLD ? 'visible' : 'hidden',
  },
  '& .cm-scroller': {
    scrollbarWidth: 'thin',
    scrollbarColor:
      'var(--color-cm-scrollbar-thumb) var(--color-cm-scrollbar-track)',
  },
})

const highlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: 'var(--color-cm-keyword)' },
  { tag: tags.controlKeyword, color: 'var(--color-cm-control-keyword)' },
  { tag: tags.operator, color: 'var(--color-cm-operator)' },
  { tag: tags.punctuation, color: 'var(--color-cm-punctuation)' },
  { tag: tags.string, color: 'var(--color-cm-string)' },
  { tag: tags.number, color: 'var(--color-cm-number)' },
  { tag: tags.bool, color: 'var(--color-cm-bool)' },
  { tag: tags.null, color: 'var(--color-cm-null)' },
  { tag: tags.variableName, color: 'var(--color-cm-variable)' },
  {
    tag: tags.definition(tags.variableName),
    color: 'var(--color-cm-definition)',
  },
  {
    tag: tags.function(tags.variableName),
    color: 'var(--color-cm-function)',
  },
  { tag: tags.propertyName, color: 'var(--color-cm-property)' },
  {
    tag: tags.comment,
    color: 'var(--color-cm-comment)',
    fontStyle: 'italic',
  },
  {
    tag: tags.lineComment,
    color: 'var(--color-cm-comment)',
    fontStyle: 'italic',
  },
  {
    tag: tags.blockComment,
    color: 'var(--color-cm-comment)',
    fontStyle: 'italic',
  },
  { tag: tags.typeName, color: 'var(--color-cm-type)' },
  { tag: tags.className, color: 'var(--color-cm-class)' },
  { tag: tags.regexp, color: 'var(--color-cm-regexp)' },
])

const theme = [editorTheme, syntaxHighlighting(highlightStyle)]

export { theme }
