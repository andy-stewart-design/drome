import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

import {
  generalGutter,
  generalLine,
  generalMatching,
  generalPanel,
  generalScroller,
  generalSearchField,
  generalTooltip,
} from './theme-utils'

// Pritive
const colorWhite = 'var(--color-white)'
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
const moduleKeyword = colorCyan[200]
const classIdentifier = colorNeonYellow
const variableDeclaration = colorPurple
const variableReference = foregroundPrimary
const bracket = colorNeutral[400]
const boolean = colorNeonYellow

// UI elements
const darkBackground = '#16191c' // Darker background for better contrast
const highlightBackground = '#ffffff15'
const tooltipBackground = '#05101d' // Darker tooltip for better contrast
// const activeBracketBg = '#0a5999b0'
// const activeBracketBorder = 'transparent'

// // Diff/merge specific colors
// const addedBackground = '#0e4e1d50' // Dark green with transparency for insertions
// const removedBackground = '#78112240' // Dark red with transparency for deletions
// const addedText = '#4ce660' // Bright green for added text (matching string color)
// const removedText = '#ff6b7d' // Bright red for removed text

const abyssTheme = EditorView.theme(
  {
    // Base editor styles
    '&': {
      color: 'var(--cm-editor-color-fg)',
      backgroundColor: 'var(--cm-editor-color-bg)',
      fontSize: 'var(--cm-editor-font-size)',
      fontFamily: 'var(--cm-editor-font-family)',
      width: '100vw',
      height: '100vh',
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
    '.cm-search.cm-panel.cm-textfield': {
      color: foregroundPrimary,
      borderRadius: generalSearchField.borderRadius,
      padding: generalSearchField.padding,
    },

    // Panels
    '.cm-panels': {
      backgroundColor: darkBackground,
      color: foregroundPrimary,
    },
    '.cm-panels.cm-panels-top': {
      borderBottom: '2px solid #0a3555',
    },
    '.cm-panels.cm-panels-bottom': {
      borderTop: '2px solid #0a3555',
    },
    '.cm-panel button': {
      backgroundColor: darkBackground,
      color: foregroundPrimary,
      border: generalPanel.border,
      borderRadius: generalPanel.borderRadius,
      padding: generalPanel.padding,
    },
    '.cm-panel button:hover': {
      backgroundColor: '#0a3555',
    },

    // Line highlighting
    '.cm-activeLine': {
      backgroundColor: highlightBackground,
      borderRadius: generalLine.borderRadius,
    },

    // Gutters
    '.cm-gutters': {
      backgroundColor: colorNeutral[950],
      color: colorNeutral[600],
      border: generalGutter.border,
      paddingRight: generalGutter.paddingRight,
    },
    '.cm-activeLineGutter': {
      backgroundColor: highlightBackground,
      color: foregroundPrimary,
      fontWeight: generalGutter.fontWeight,
    },
    '.cm-lineNumbers': {
      fontSize: generalGutter.fontSize,
    },
    '.cm-foldGutter': {
      fontSize: generalGutter.fontSize,
    },
    '.cm-foldGutter .cm-gutterElement': {
      color: '#5f7e97',
      cursor: 'pointer',
    },
    '.cm-foldGutter .cm-gutterElement:hover': {
      color: foregroundPrimary,
    },

    // Diff/Merge View Styles
    // Inserted/Added Content
    // '.cm-insertedLine': {
    //   textDecoration: generalDiff.insertedTextDecoration,
    //   backgroundColor: addedBackground,
    //   color: addedText,
    //   padding: generalDiff.insertedLinePadding,
    //   borderRadius: generalDiff.borderRadious,
    // },
    // 'ins.cm-insertedLine, ins.cm-insertedLine:not(:has(.cm-changedText))': {
    //   textDecoration: generalDiff.insertedTextDecoration,
    //   backgroundColor: `${addedBackground} !important`,
    //   color: addedText,
    //   padding: generalDiff.insertedLinePadding,
    //   borderRadius: generalDiff.borderRadious,
    //   border: `1px solid ${addedText}40`,
    // },
    // 'ins.cm-insertedLine .cm-changedText': {
    //   background: 'transparent !important',
    // },

    // Deleted/Removed Content
    // '.cm-deletedLine': {
    //   textDecoration: generalDiff.deletedTextDecoration,
    //   backgroundColor: removedBackground,
    //   color: removedText,
    //   padding: generalDiff.insertedLinePadding,
    //   borderRadius: generalDiff.borderRadious,
    // },
    // 'del.cm-deletedLine, del, del:not(:has(.cm-deletedText))': {
    //   textDecoration: generalDiff.deletedTextDecoration,
    //   backgroundColor: `${removedBackground} !important`,
    //   color: removedText,
    //   padding: generalDiff.insertedLinePadding,
    //   borderRadius: generalDiff.borderRadious,
    //   border: `1px solid ${removedText}40`,
    // },
    // 'del .cm-deletedText, del .cm-changedText': {
    //   background: 'transparent !important',
    // },

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

    // Selection matches
    '.cm-selectionMatch': {
      backgroundColor: colorNeutral[800],
      outline: `1px solid transparent`,
      borderRadius: generalMatching.borderRadius,
    },

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
      width: generalScroller.width,
      height: generalScroller.height,
    },
    '& .cm-scroller::-webkit-scrollbar-track': {
      background: darkBackground,
    },
    '& .cm-scroller::-webkit-scrollbar-thumb': {
      backgroundColor: colorNeutral[600],
      borderRadius: generalScroller.borderRadius,
      border: `3px solid ${darkBackground}`,
    },
    '& .cm-scroller::-webkit-scrollbar-thumb:hover': {
      backgroundColor: colorNeutral[400],
    },

    // Ghost text
    '.cm-ghostText': {
      opacity: '0.5',
      color: colorWhite,
    },
  },
  { dark: true },
)

/**
 * Enhanced syntax highlighting for the Abyss theme
 */
const abyssHighlightStyle = HighlightStyle.define([
  // Keywords and control flow
  {
    tag: t.keyword,
    color: 'var(--cm-declaration-keyword)',
    fontWeight: 'regular',
  },
  { tag: t.moduleKeyword, color: moduleKeyword, fontWeight: 'regular' },

  // Names and variables
  // { tag: [t.name, t.deleted, t.character, t.macroName], color: base08 },
  { tag: [t.variableName], color: variableReference },
  { tag: [t.propertyName], color: foregroundPrimary, fontStyle: 'normal' },

  // Classes and types
  { tag: [t.className], color: classIdentifier, fontStyle: 'italic' },
  { tag: [t.namespace], color: colorNeonPink, fontStyle: 'italic' },

  // Operators and punctuation - clearer blues
  { tag: [t.operator, t.operatorKeyword], color: foregroundPrimary },
  { tag: [t.bracket], color: foregroundPrimary },
  { tag: [t.brace], color: foregroundPrimary },
  { tag: [t.punctuation], color: foregroundPrimary },

  // Functions and parameters
  // { tag: [t.function(t.variableName), t.labelName], color: colorPurple },
  { tag: [t.definition(t.variableName)], color: variableDeclaration },

  // Constants and literals
  { tag: t.number, color: colorNeonPink },
  { tag: t.changed, color: colorNeonPink },
  { tag: t.annotation, color: colorNeonPink, fontStyle: 'italic' },
  { tag: t.modifier, color: colorNeonPink, fontStyle: 'italic' },
  { tag: t.self, color: colorNeonPink },
  {
    tag: [t.color, t.constant(t.name), t.standard(t.name)],
    color: colorNeonPink,
  },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: boolean },

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
  { tag: t.controlKeyword, color: colorCyan[200], fontWeight: 'bold' },
  // { tag: t.deleted, color: base08 },
  { tag: t.labelName, color: colorPurple },
  { tag: t.string, color: colorNeonPink },
])

/**
 * Combined Abyss theme extension
 */
const theme = [abyssTheme, syntaxHighlighting(abyssHighlightStyle)]

export { theme }
