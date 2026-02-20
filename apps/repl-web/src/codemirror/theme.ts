import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

const ALLOW_FOLD = false

const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--cm-color-background)',
    color: 'var(--cm-color-text)',
    fontSize: 'var(--cm-editor-font-size)',
  },
  // Focus outline
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-content': {
    caretColor: 'var(--cm-color-caret)',
    lineHeight: 'var(--cm-line-height, 1.6)',
  },
  '.cm-cursor': {
    borderLeft: 'var(--cm-caret-width, 1.5px) solid var(--cm-color-caret)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--cm-color-gutter-bg)',
    color: 'var(--cm-color-gutter-fg)',
    borderRight: '1px solid var(--cm-color-gutter-border)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'var(--cm-color-active-line-gutter-bg)',
    color: 'var(--cm-color-active-line-gutter-fg)',
  },
  '& .cm-line': {
    backgroundColor: 'var(--cm-color-line-bg)',
    inlineSize: 'var(--cm-line-inline-size)',
  },
  '& .cm-line.cm-activeLine': {
    backgroundColor: 'var(--cm-color-active-line-bg)',
    borderRadius: 'var(--cm-active-line-radius, 3px)',
  },
  '.cm-selectionBackground, &.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground':
    {
      backgroundColor: 'var(--cm-color-selection-bg)',
      borderRadius: 'var(--cm-selection-radius, 2px)',
      outline:
        'var(--cm-selection-outline-width, 2px) solid var(--cm-color-selection-bg)',
    },
  '& .cm-line .cm-matchingBracket, & .cm-line .cm-nonmatchingBracket': {
    outline: 'none',
  },
  '& .cm-line .cm-matchingBracket': {
    backgroundColor: 'var(--cm-color-matching-bracket-bg)',
  },
  '& .cm-line .cm-matchingBracket > span': {
    color: 'var(--cm-color-matching-bracket-fg)',
  },
  '& .cm-line .cm-nonmatchingBracket': {
    backgroundColor: 'var(--cm-color-nonmatching-bracket-bg)',
  },
  '& .cm-line .cm-nonmatchingBracket > span': {
    color: 'var(--cm-color-nonmatching-bracket-fg)',
  },
  '& .cm-line .cm-selectionMatch': {
    backgroundColor: 'var(--cm-color-selection-match-bg)',
  },
  '& .cm-line .cm-selectionMatch > span': {
    color: 'var(--cm-color-selection-match-fg)',
  },
  '& .cm-gutters > .cm-gutter.cm-lineNumbers ': {
    fontSize: '12px',
    color: 'var(--cm-color-line-numbers, coral)',
    paddingInlineStart: '0.5rem',
  },
  '& .cm-gutters > .cm-gutter.cm-lineNumbers > .cm-gutterElement': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBlockStart: '0.875px',
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
      'var(--cm-color-scrollbar-thumb) var(--cm-color-scrollbar-track)',
  },
})

const highlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: 'var(--cm-color-keyword)' },
  { tag: tags.controlKeyword, color: 'var(--cm-color-control-keyword)' },
  { tag: tags.operator, color: 'var(--cm-color-operator)' },
  { tag: tags.punctuation, color: 'var(--cm-color-punctuation)' },
  { tag: tags.string, color: 'var(--cm-color-string)' },
  { tag: tags.number, color: 'var(--cm-color-number)' },
  { tag: tags.bool, color: 'var(--cm-color-bool)' },
  { tag: tags.null, color: 'var(--cm-color-null)' },
  { tag: tags.variableName, color: 'var(--cm-color-variable)' },
  {
    tag: tags.definition(tags.variableName),
    color: 'var(--cm-color-definition)',
  },
  {
    tag: tags.function(tags.variableName),
    color: 'var(--cm-color-function)',
  },
  { tag: tags.propertyName, color: 'var(--cm-color-property)' },
  {
    tag: tags.comment,
    color: 'var(--cm-color-comment)',
    fontStyle: 'italic',
  },
  {
    tag: tags.lineComment,
    color: 'var(--cm-color-comment)',
    fontStyle: 'italic',
  },
  {
    tag: tags.blockComment,
    color: 'var(--cm-color-comment)',
    fontStyle: 'italic',
  },
  { tag: tags.typeName, color: 'var(--cm-color-type)' },
  { tag: tags.className, color: 'var(--cm-color-class)' },
  { tag: tags.regexp, color: 'var(--cm-color-regexp)' },
])

const theme = [editorTheme, syntaxHighlighting(highlightStyle)]

export { theme }
