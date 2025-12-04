import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

import {
  generalContent,
  generalCursor,
  generalDiff,
  generalGutter,
  generalLine,
  generalMatching,
  generalPanel,
  generalPlaceholder,
  generalScroller,
  generalSearchField,
  generalTooltip,
} from './theme-utils'

// Base colors - Ocean depths
const colorWhite = 'var(--color-white)' // - Pure white for maximum contrast
const colorNeutral50 = 'var(--color-neutral-50)' // - Foreground (lighter blue for enhanced readability)
const colorNeutral600 = 'var(--color-neutral-600)' // - Selection (more vibrant blue for better visibility)
const colorNeutral800 = 'var(--color-neutral-800)' // - Selection (more vibrant blue for better visibility)
const colorNeutral950 = 'var(--color-neutral-950)' // - Background (deep ocean blue)
const colorNeonPink = 'var(--color-neon-pink)' // - Constants (softer pink)
const colorNeonCyan = 'var(--color-neon-cyan)' // - Keywords (brighter cyan blue)
const colorPurple = 'var(--color-purple)' // - Functions (softer purple)

const base08 = '#5caeff' // - Variables (softer azure blue)
const base09 = '#4b6480' // - Comments (brighter blue-gray)
const base0D = '#ffd47b' // - Classes (warmer gold)
const base0F = '#59d6ff' // - Tags (brighter cyan)
// UI elements
const invalid = '#ff5370'
const darkBackground = '#16191c' // Darker background for better contrast
const highlightBackground = '#ffffff15'
const tooltipBackground = '#05101d' // Darker tooltip for better contrast
const cursor = colorNeonCyan
const selection = colorNeutral800
const activeBracketBg = '#0a5999b0'
const activeBracketBorder = 'transparent'
// Diff/merge specific colors
const addedBackground = '#0e4e1d50' // Dark green with transparency for insertions
const removedBackground = '#78112240' // Dark red with transparency for deletions
const addedText = '#4ce660' // Bright green for added text (matching string color)
const removedText = '#ff6b7d' // Bright red for removed text

const abyssTheme = EditorView.theme(
  {
    // Base editor styles
    '&': {
      color: colorNeutral50,
      backgroundColor: colorNeutral950,
      fontSize: generalContent.fontSize,
      fontFamily: generalContent.fontFamily,
      width: '100vw',
      height: '100vh',
      border: 'none',
      outline: 'none',
      resize: 'none',
    },

    // Content and cursor
    '.cm-content': {
      caretColor: cursor,
      lineHeight: generalContent.lineHeight,
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: cursor,
      borderLeftWidth: generalCursor.borderLeftWidth,
    },
    '.cm-fat-cursor': {
      backgroundColor: `${cursor}99`,
      color: colorNeutral950,
    },

    // Selection
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      {
        backgroundColor: selection,
      },

    // Search functionality
    '.cm-searchMatch': {
      backgroundColor: '#155ab380',
      outline: `1px solid transparent`,
      borderRadius: generalSearchField.borderRadius,

      '& span': {
        color: colorWhite,
      },
    },
    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: '#2a6ac080',
      color: colorWhite,
      padding: generalSearchField.padding,

      '& span': {
        color: colorWhite,
      },
    },
    '.cm-search.cm-panel.cm-textfield': {
      color: colorNeutral50,
      borderRadius: generalSearchField.borderRadius,
      padding: generalSearchField.padding,
    },

    // Panels
    '.cm-panels': {
      backgroundColor: darkBackground,
      color: colorNeutral50,
    },
    '.cm-panels.cm-panels-top': {
      borderBottom: '2px solid #0a3555',
    },
    '.cm-panels.cm-panels-bottom': {
      borderTop: '2px solid #0a3555',
    },
    '.cm-panel button': {
      backgroundColor: darkBackground,
      color: colorNeutral50,
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
      backgroundColor: colorNeutral950,
      color: colorNeutral600,
      border: generalGutter.border,
      paddingRight: generalGutter.paddingRight,
    },
    '.cm-activeLineGutter': {
      backgroundColor: highlightBackground,
      color: colorNeutral50,
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
      color: colorNeutral50,
    },

    // Diff/Merge View Styles
    // Inserted/Added Content
    '.cm-insertedLine': {
      textDecoration: generalDiff.insertedTextDecoration,
      backgroundColor: addedBackground,
      color: addedText,
      padding: generalDiff.insertedLinePadding,
      borderRadius: generalDiff.borderRadious,
    },
    'ins.cm-insertedLine, ins.cm-insertedLine:not(:has(.cm-changedText))': {
      textDecoration: generalDiff.insertedTextDecoration,
      backgroundColor: `${addedBackground} !important`,
      color: addedText,
      padding: generalDiff.insertedLinePadding,
      borderRadius: generalDiff.borderRadious,
      border: `1px solid ${addedText}40`,
    },
    'ins.cm-insertedLine .cm-changedText': {
      background: 'transparent !important',
    },

    // Deleted/Removed Content
    '.cm-deletedLine': {
      textDecoration: generalDiff.deletedTextDecoration,
      backgroundColor: removedBackground,
      color: removedText,
      padding: generalDiff.insertedLinePadding,
      borderRadius: generalDiff.borderRadious,
    },
    'del.cm-deletedLine, del, del:not(:has(.cm-deletedText))': {
      textDecoration: generalDiff.deletedTextDecoration,
      backgroundColor: `${removedBackground} !important`,
      color: removedText,
      padding: generalDiff.insertedLinePadding,
      borderRadius: generalDiff.borderRadious,
      border: `1px solid ${removedText}40`,
    },
    'del .cm-deletedText, del .cm-changedText': {
      background: 'transparent !important',
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
    '.cm-diagnostic': {
      '&-error': {
        borderLeft: `3px solid ${invalid}`,
      },
      '&-warning': {
        borderLeft: `3px solid ${colorNeonPink}`,
      },
      '&-info': {
        borderLeft: `3px solid ${colorPurple}`,
      },
    },
    '.cm-lintPoint-error': {
      borderBottom: `2px wavy ${invalid}`,
    },
    '.cm-lintPoint-warning': {
      borderBottom: `2px wavy ${colorNeonPink}`,
    },

    // Matching brackets
    '.cm-matchingBracket': {
      backgroundColor: activeBracketBg,
      outline: `1px solid ${activeBracketBorder}`,
      borderRadius: generalMatching.borderRadius,
    },
    '.cm-nonmatchingBracket': {
      backgroundColor: '#780e1e80',
      outline: `1px solid ${invalid}`,
      borderRadius: generalMatching.borderRadius,
    },

    // Selection matches
    '.cm-selectionMatch': {
      backgroundColor: colorNeutral800,
      outline: `1px solid transparent`,
      borderRadius: generalMatching.borderRadius,
    },

    // Fold placeholder
    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      color: '#5f7e97',
      fontStyle: 'italic',
      border: `1px dotted ${activeBracketBorder}`,
      borderRadius: generalPlaceholder.borderRadius,
      padding: generalPlaceholder.padding,
      margin: generalPlaceholder.margin,
    },

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
      backgroundColor: '#3d4147',
      borderRadius: generalScroller.borderRadius,
      border: `3px solid ${darkBackground}`,
    },
    '& .cm-scroller::-webkit-scrollbar-thumb:hover': {
      backgroundColor: '#4e545c',
    },

    // Ghost text
    '.cm-ghostText': {
      opacity: '0.5',
      color: '#ffffff',
    },
  },
  { dark: true },
)

/**
 * Enhanced syntax highlighting for the Abyss theme
 */
const abyssHighlightStyle = HighlightStyle.define([
  // Keywords and control flow
  { tag: t.keyword, color: colorNeonCyan, fontWeight: 'regular' },
  { tag: t.controlKeyword, color: base0F, fontWeight: 'regular' },
  { tag: t.moduleKeyword, color: colorNeonCyan, fontWeight: 'regular' },

  // Names and variables
  { tag: [t.name, t.deleted, t.character, t.macroName], color: base08 },
  { tag: [t.variableName], color: colorNeutral50 },
  { tag: [t.propertyName], color: colorNeutral50, fontStyle: 'normal' },

  // Classes and types
  { tag: [t.className], color: base0D, fontStyle: 'italic' },
  { tag: [t.namespace], color: colorNeonPink, fontStyle: 'italic' },

  // Operators and punctuation - clearer blues
  { tag: [t.operator, t.operatorKeyword], color: colorNeutral50 },
  { tag: [t.bracket], color: colorNeutral50 },
  { tag: [t.brace], color: colorNeutral50 },
  { tag: [t.punctuation], color: colorNeutral50 },

  // Functions and parameters
  { tag: [t.function(t.variableName), t.labelName], color: colorPurple },
  { tag: [t.definition(t.variableName)], color: colorPurple },

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
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: '#ff9e64' },

  // Strings and regex
  { tag: [t.processingInstruction, t.inserted], color: colorNeonPink },
  { tag: [t.special(t.string), t.regexp], color: colorNeonPink },

  // Punctuation and structure
  { tag: t.definition(t.typeName), color: colorPurple, fontWeight: 'bold' },
  { tag: [t.operator, t.operatorKeyword], color: colorNeonCyan },
  { tag: [t.bracket], color: '#8da0bf' },
  { tag: [t.brace], color: '#8da0bf' },
  { tag: [t.punctuation], color: '#8da0bf' },

  // Comments and documentation
  { tag: t.meta, color: base09 },
  { tag: t.comment, fontStyle: 'italic', color: base09 },
  { tag: t.docComment, fontStyle: 'italic', color: base09 },

  // HTML/XML elements
  //   { tag: [t.tagName], color: base0F },
  //   { tag: [t.attributeName], color: '#ffd580' },

  // Markdown and text formatting
  { tag: [t.heading], fontWeight: 'bold', color: colorNeutral50 },
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
  { tag: [t.invalid], color: invalid, textDecoration: 'underline wavy' },
  { tag: [t.strikethrough], color: invalid, textDecoration: 'line-through' },

  // Enhanced syntax highlighting
  { tag: t.constant(t.name), color: colorNeonPink },
  { tag: t.controlKeyword, color: colorNeonCyan, fontWeight: 'bold' },
  { tag: t.deleted, color: base08 },
  { tag: t.labelName, color: colorPurple },
  { tag: t.string, color: colorNeonPink },
])

/**
 * Combined Abyss theme extension
 */
const theme = [abyssTheme, syntaxHighlighting(abyssHighlightStyle)]

export { theme }
