// TODO: update tooltip/autocomplete styles

import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

const abyssTheme = EditorView.theme(
  {
    // Base editor styles
    '&': {
      color: 'var(--cm-editor-color-fg)',
      backgroundColor: 'var(--cm-editor-color-bg)',
      fontSize: 'var(--cm-editor-font-size)',
      fontFamily: 'var(--cm-editor-font-family)',
      width: 'var(--cm-editor-width)',
      height: 'var(--cm-editor-height)',
      border: 'none',
      outline: 'none',
      resize: 'none',
    },

    // Content and cursor
    '.cm-content': {
      caretColor: 'var(--cm-cursor-fg)',
      lineHeight: 'var(--cm-editor-line-height)',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: 'var(--cm-cursor-fg)',
      borderLeftWidth: 'var(--cm-cursor-width)',
    },

    // Selection
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      {
        backgroundColor: 'var(--cm-selection-color-bg)',
        color: 'var(--cm-selection-color-fg)',
        borderRadius: 'var(--cm-selection-border-radius)',
      },

    // Selection matches
    '.cm-selectionMatch': {
      backgroundColor: 'var(--cm-selection-match-color-bg)',
      outline: `var(--cm-selection-match-outline)`,
      borderRadius: 'var(--cm-selection-match-border-radius)',
    },

    // Search functionality
    '.cm-searchMatch': {
      backgroundColor: 'var(--cm-search-match-color-bg)',
      color: 'var(--cm-search-match-color-fg)',
      outline: 'var(--cm-search-match-outline)',
      borderRadius: 'var(--cm-search-match-border-radius)',

      '& span': {
        color: 'var(--cm-search-match-color-fg)',
      },
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: 'var(--cm-search-match-selected-color-bg)',
      color: 'var(--cm-search-match-selected-color-fg)',
      padding: 'var(--cm-search-match-selected-color-padding)',

      '& span': {
        color: 'var(--cm-search-match-selected-color-fg)',
      },
    },

    // Panels
    '.cm-panels': {
      backgroundColor: 'var(--cm-panel-color-bg)',
      color: 'var(--cm-panel-color-fg)',
    },
    '.cm-panels.cm-panels-top': {
      borderBottom: 'var(--cm-top-panel-border-bottom)',
    },
    '.cm-panels.cm-panels-bottom': {
      borderTop: 'var(--cm-bottom-panel-border-top)',
    },
    '.cm-panel button': {
      backgroundColor: 'var(--cm-panel-button-color-bg)',
      backgroundImage: 'none',
      color: 'var(--cm-panel-button-color-fg)',
      border: 'var(--cm-panel-button-border)',
      borderRadius: 'var(--cm-panel-button-border-radius)',
      padding: 'var(--cm-panel-button-padding)',
    },
    '.cm-panel button:hover': {
      backgroundColor: 'var(--cm-panel-button-hover-color-bg)',
      color: 'var(--cm-panel-button-hover-color-fg)',
    },
    '.cm-panel .cm-textfield': {
      backgroundColor: 'var(--cm-panel-input-color-bg)',
      color: 'var(--cm-panel-input-color-fg)',
      border: 'var(--cm-panel-input-border)',
      borderRadius: 'var(--cm-panel-input-border-radius)',
      padding: 'var(--cm-panel-input-padding)',
    },
    '.cm-panel label input': {
      backgroundColor: 'var(--cm-panel-input-color-bg)',
      color: 'var(--cm-panel-input-color-fg)',
      border: 'var(--cm-panel-input-border)',
      borderRadius: 'var(--cm-panel-input-border-radius)',
      padding: 'var(--cm-panel-input-padding)',
    },

    // Line highlighting
    '.cm-activeLine': {
      backgroundColor: 'var(--cm-active-line-color-bg)',
      borderRadius: 'var(--cm-active-line-border-radius)',
      outline: 'var(--cm-active-line-outline)',
    },

    // Gutters
    '.cm-gutters': {
      backgroundColor: 'var(--cm-gutters-color-bg)',
      color: 'var(--cm-gutters-color-fg)',
    },
    '.cm-gutters .cm-gutterElement': {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'var(--cm-gutters-active-line-color-bg)',
      color: 'var(--cm-gutters-active-line-color-fg)',
      outline: 'var(--cm-active-line-outline)',
    },
    '.cm-lineNumbers': {
      fontSize: 'var(--cm-gutters-font-size)',
    },
    '.cm-foldGutter': {
      fontSize: 'var(--cm-gutters-font-size)',
    },

    // Tooltips and autocomplete
    '.cm-tooltip': {
      backgroundColor: '#05101d',
      border: '1px solid #084671',
      borderRadius: '4px',
      padding: '4px 8px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li': {
        padding: '4px 8px',
        lineHeight: '1.3',
      },
      '& > ul > li[aria-selected]': {
        backgroundColor: '#084671',
        color: '#e0edff',
        borderRadius: '3px',
      },
      '& > ul > li > span.cm-completionIcon': {
        color: '#5f7e97',
        paddingRight: '8px',
      },
      '& > ul > li > span.cm-completionDetail': {
        color: '#5f7e97',
        fontStyle: 'italic',
      },
    },
    '.cm-tooltip .cm-tooltip-arrow:before': {
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
    },
    '.cm-tooltip .cm-tooltip-arrow:after': {
      borderTopColor: '#05101d',
      borderBottomColor: '#05101d',
    },

    // Focus outline
    '&.cm-focused': {
      outline: 'none',
    },

    // Scrollbars
    '& .cm-scroller::-webkit-scrollbar': {
      width: 'var(--cm-scrollbar-width)',
      height: 'var(--cm-scrollbar-height)',
    },
    '& .cm-scroller::-webkit-scrollbar-track': {
      background: 'var(--cm-scrollbar-color-bg)',
    },
    '& .cm-scroller::-webkit-scrollbar-thumb': {
      backgroundColor: 'var(--cm-scrollbar-thumb-color-bg)',
      border: 'var(--cm-scrollbar-thumb-border)',
      borderRadius: 'var(--cm-scrollbar-thumb-border-radius)',
    },
    '& .cm-scroller::-webkit-scrollbar-thumb:hover': {
      backgroundColor: 'var(--cm-scrollbar-thumb-hover-color-bg)',
    },
    '& .cm-scroller::-webkit-scrollbar-corner': {
      backgroundColor: 'var(--cm-scrollbar-corner-color-bg)',
      border: 'var(--cm-scrollbar-corner-border)',
    },
  },
  { dark: true },
)

const highlightStyle = HighlightStyle.define([
  // Keywords and control flow
  {
    tag: t.keyword,
    color: 'var(--cm-syntax-declaration-keyword-color-fg)',
    fontWeight: 'regular',
  },
  {
    tag: t.moduleKeyword,
    color: 'var(--cm-syntax-module-keyword-color-fg)',
    fontWeight: 'regular',
  },

  // Names and variables
  {
    tag: [t.definition(t.variableName)],
    color: 'var(--cm-syntax-variable-declaration-color-fg)',
  },
  {
    tag: [t.variableName],
    color: 'var(--cm-syntax-variable-reference-color-fg)',
  },
  {
    tag: [t.propertyName],
    color: 'var(--cm-syntax-property-name-color-fg)',
    fontStyle: 'normal',
  },
  {
    tag: [t.definition(t.propertyName)],
    color: 'var(--cm-syntax-property-object-key-color-fg)',
    fontStyle: 'normal',
  },
  {
    tag: [t.function(t.definition(t.variableName))],
    color: 'var(--cm-syntax-function-declaration-color-fg)',
  },
  {
    tag: [t.function(t.variableName), t.labelName],
    color: 'var(--cm-syntax-function-reference-color-fg)',
  },

  // Classes and types
  {
    tag: [t.className],
    color: 'var(--cm-syntax-class-identifier-color-fg)',
    fontStyle: 'italic',
  },

  // Constants and literals
  { tag: t.number, color: 'var(--cm-syntax-number-color-fg)' },
  { tag: t.bool, color: 'var(--cm-syntax-boolean-color-fg)' },
  { tag: t.self, color: 'var(--cm-syntax-self-color-fg)' },

  // Strings and regex
  { tag: t.string, color: 'var(--cm-syntax-string-color-fg)' },
  { tag: t.regexp, color: 'var(--cm-syntax-regex-color-fg)' },

  // Punctuation and structure
  {
    tag: [t.operator, t.operatorKeyword],
    color: 'var(--cm-syntax-operator-color-fg)',
  },
  { tag: [t.bracket], color: 'var(--cm-syntax-bracket-color-fg)' },
  { tag: [t.brace], color: 'var(--cm-syntax-bracket-color-fg)' },
  { tag: [t.punctuation], color: 'var(--cm-syntax-bracket-color-fg)' },

  // Comments and documentation
  { tag: t.meta, color: 'var(--cm-syntax-comment-color-fg)' },
  {
    tag: t.comment,
    fontStyle: 'italic',
    color: 'var(--cm-syntax-comment-color-fg)',
  },
  {
    tag: t.docComment,
    fontStyle: 'italic',
    color: 'var(--cm-syntax-comment-color-fg)',
  },

  // Enhanced syntax highlighting
  {
    tag: t.controlKeyword,
    color: 'var(--cm-syntax-control-keyword-color-fg)',
    fontWeight: 'bold',
  },
])

const theme = [abyssTheme, syntaxHighlighting(highlightStyle)]

export { theme }
