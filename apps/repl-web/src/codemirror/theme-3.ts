import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'
import { generalTooltip } from './theme-utils'

// Pritive
const colorNeutral = {
  50: 'var(--color-neutral-50)',
  100: 'var(--color-neutral-100)',
  200: 'var(--color-neutral-200)',
  300: 'var(--color-neutral-300)',
  400: 'var(--color-neutral-400)',
  600: 'var(--color-neutral-600)',
  800: 'var(--color-neutral-800)',
  950: 'var(--color-neutral-950)',
}
const colorCyan = {
  100: 'var(--color-cyan-100)',
  200: 'var(--color-cyan-200)',
  500: 'var(--color-cyan-500)',
  700: 'var(--color-cyan-700)',
}
const colorNeonPink = 'var(--color-neon-pink)'
const colorPurple = 'var(--color-purple)'
const colorNeonYellow = 'var(--color-neon-yellow)'

// Semantic
const foregroundPrimary = colorNeutral[50]
// const declarationKeyword = colorCyan[200] // const, let, etc
const bracket = colorNeutral[400]

// UI elements
const tooltipBackground = '#05101d' // Darker tooltip for better contrast

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
      backgroundColor: tooltipBackground,
      border: '1px solid #084671',
      borderRadius: generalTooltip.borderRadius,
      padding: generalTooltip.padding,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
    },
    '.cm-tooltip-autocomplete': {
      '& > ul > li': {
        padding: generalTooltip.padding,
        lineHeight: generalTooltip.lineHeight,
      },
      '& > ul > li[aria-selected]': {
        backgroundColor: '#084671',
        color: '#e0edff',
        borderRadius: generalTooltip.borderRadiusSelected,
      },
      '& > ul > li > span.cm-completionIcon': {
        color: '#5f7e97',
        paddingRight: generalTooltip.paddingRight,
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
      borderTopColor: tooltipBackground,
      borderBottomColor: tooltipBackground,
    },

    // Diagnostics styling
    // '.cm-diagnostic': {
    //   '&-error': {
    //     borderLeft: `3px solid ${invalid}`,
    //   },
    //   '&-warning': {
    //     borderLeft: `3px solid ${colorNeonPink}`,
    //   },
    //   '&-info': {
    //     borderLeft: `3px solid ${colorPurple}`,
    //   },
    // },
    // '.cm-lintPoint-error': {
    //   borderBottom: `2px wavy ${invalid}`,
    // },
    // '.cm-lintPoint-warning': {
    //   borderBottom: `2px wavy ${colorNeonPink}`,
    // },

    // Matching brackets
    // '.cm-matchingBracket': {
    //   backgroundColor: activeBracketBg,
    //   outline: `1px solid ${activeBracketBorder}`,
    //   borderRadius: generalMatching.borderRadius,
    // },
    // '.cm-nonmatchingBracket': {
    //   backgroundColor: '#780e1e80',
    //   outline: `1px solid ${invalid}`,
    //   borderRadius: generalMatching.borderRadius,
    // },

    // Fold placeholder
    // '.cm-foldPlaceholder': {
    //   backgroundColor: 'transparent',
    //   color: '#5f7e97',
    //   fontStyle: 'italic',
    //   border: `1px dotted ${activeBracketBorder}`,
    //   borderRadius: generalPlaceholder.borderRadius,
    //   padding: generalPlaceholder.padding,
    //   margin: generalPlaceholder.margin,
    // },

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

/**
 * Enhanced syntax highlighting for the Abyss theme
 */
const highlightStyle = HighlightStyle.define([
  // Keywords and control flow
  {
    tag: t.keyword,
    color: 'var(--cm-declaration-keyword-color-fg)',
    fontWeight: 'regular',
  },
  {
    tag: t.moduleKeyword,
    color: 'var(--cm-module-keyword-color-fg)',
    fontWeight: 'regular',
  },

  // Names and variables
  {
    tag: [t.definition(t.variableName)],
    color: 'var(--cm-variable-declaration-color-fg)',
  },
  { tag: [t.variableName], color: 'var(--cm-variable-reference-color-fg)' },
  {
    tag: [t.propertyName],
    color: 'var(--cm-property-name-color-fg)',
    fontStyle: 'normal',
  },
  {
    tag: [t.definition(t.propertyName)],
    color: 'var(--cm-property-object-key-color-fg)',
    fontStyle: 'normal',
  },
  {
    tag: [t.function(t.definition(t.variableName))],
    color: 'var(--cm-function-declaration-color-fg)',
  },
  {
    tag: [t.function(t.variableName), t.labelName],
    color: 'var(--cm-function-reference-color-fg)',
  },

  // Classes and types
  {
    tag: [t.className],
    color: 'var(--cm-class-identifier-color-fg)',
    fontStyle: 'italic',
  },
  //   { tag: [t.namespace], color: colorNeonPink, fontStyle: 'italic' },

  // Operators and punctuation - clearer blues
  //   { tag: [t.operator, t.operatorKeyword], color: 'red' },
  //   { tag: [t.bracket], color: 'red' },
  //   { tag: [t.brace], color: 'red' },
  //   { tag: [t.punctuation], color: 'red' },

  // Constants and literals
  { tag: t.number, color: 'var(--cm-number-color-fg)' },
  { tag: t.bool, color: 'var(--cm-boolean-color-fg)' },
  { tag: t.changed, color: colorNeonPink },
  { tag: t.annotation, color: colorNeonPink, fontStyle: 'italic' },
  { tag: t.modifier, color: colorNeonPink, fontStyle: 'italic' },
  { tag: t.self, color: colorNeonPink },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: colorNeonPink,
  },
  { tag: [t.atom, t.special(t.variableName)], color: colorNeonYellow },

  // Strings and regex
  { tag: [t.processingInstruction, t.inserted], color: colorNeonPink },
  { tag: [t.special(t.string), t.regexp], color: colorNeonPink },

  // Punctuation and structure
  { tag: t.definition(t.typeName), color: colorPurple, fontWeight: 'bold' },
  { tag: [t.operator, t.operatorKeyword], color: colorCyan[200] },
  { tag: [t.bracket], color: bracket },
  { tag: [t.brace], color: bracket },
  { tag: [t.punctuation], color: bracket },

  // Comments and documentation
  { tag: t.meta, color: colorNeutral[600] },
  { tag: t.comment, fontStyle: 'italic', color: colorNeutral[600] },
  { tag: t.docComment, fontStyle: 'italic', color: colorNeutral[600] },

  // HTML/XML elements
  //   { tag: [t.tagName], color: base0F },
  //   { tag: [t.attributeName], color: '#ffd580' },

  // Markdown and text formatting
  { tag: [t.heading], fontWeight: 'bold', color: colorNeutral[50] },
  { tag: [t.strong], fontWeight: 'bold' },
  { tag: [t.emphasis], fontStyle: 'italic' },

  // Links and URLs
  //   { tag: [t.link], color: base10, fontWeight: '500' },
  //   {
  //     tag: [t.url],
  //     color: base11,
  //     textDecoration: 'underline',
  //     textUnderlineOffset: '2px',
  //   },

  // Special states
  //   { tag: [t.invalid], color: invalid, textDecoration: 'underline wavy' },
  //   { tag: [t.strikethrough], color: invalid, textDecoration: 'line-through' },

  // Enhanced syntax highlighting
  { tag: t.constant(t.name), color: colorNeonPink },
  {
    tag: t.controlKeyword,
    color: 'var(--cm-control-keyword-color-fg)',
    fontWeight: 'bold',
  },
  // { tag: t.deleted, color: base08 },
  { tag: t.labelName, color: colorPurple },
  { tag: t.string, color: colorNeonPink },
])

/**
 * Combined Abyss theme extension
 */
const theme = [abyssTheme, syntaxHighlighting(highlightStyle)]

export { theme }
