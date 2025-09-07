export type IconStyle = 'emoji' | 'nerd-font' | 'unicode' | 'ascii'

export interface IconSet {
  directory: string
  git: string
  model: string
  context: string
  cost: string
  tokens: string
  session: string
  version: string
  style: string
  ccVersion: string
}

// Default emoji icons (current)
export const emojiIcons: IconSet = {
  directory: '📁',
  git: '🌿',
  model: '🤖',
  context: '🧠',
  cost: '💵',
  tokens: '📊',
  session: '⌛',
  version: '🏷️',
  style: '🎨',
  ccVersion: '📟'
}

// Nerd Font icons (requires Nerd Font installed)
// Updated to use icons that work with JetBrains Mono Nerd Font
export const nerdFontIcons: IconSet = {
  directory: '󰉋',  // Simple folder (U+F024B)
  git: '󰊢',       // Simple git (U+F02A2)
  model: '󱤇',     // Simple chip (U+F1907)
  context: '󰾶',   // Simple brain (U+F0FB6)
  cost: '󰈙',      // Material cash (U+F0219)
  tokens: '󱪙',    // Material graph (U+F1A99)
  session: '󱎫',   // Material clock (U+F13AB)
  version: '󰈙',   // Material cash (U+F0219) - for version tag
  style: '󰏘',     // Material palette (U+F03D8) - for style
  ccVersion: '󰘚'  // Material chip (U+F061A) - for CC version
}

// Alternative Nerd Font set (more minimal)
export const nerdFontMinimalIcons: IconSet = {
  directory: '',  // nf-oct-file_directory
  git: '',       // nf-fa-git
  model: 'ﮧ',     // nf-mdi-chip
  context: '',   // nf-mdi-memory
  cost: '$',      // plain dollar sign
  tokens: '',    // nf-oct-graph
  session: '',   // nf-mdi-clock
  version: '',   // nf-oct-tag
  style: '',     // nf-oct-paintbrush
  ccVersion: ''  // nf-fa-info
}

// Pure Unicode symbols (no emoji, better compatibility)
export const unicodeIcons: IconSet = {
  directory: '▸',
  git: '⎇',
  model: '◆',
  context: '◉',
  cost: '$',
  tokens: '≡',
  session: '◷',
  version: '◈',
  style: '◐',
  ccVersion: 'ℹ'
}

// ASCII only (maximum compatibility)
export const asciiIcons: IconSet = {
  directory: '[DIR]',
  git: '[GIT]',
  model: '[MDL]',
  context: '[CTX]',
  cost: '[$]',
  tokens: '[TOK]',
  session: '[TIME]',
  version: '[VER]',
  style: '[STY]',
  ccVersion: '[CC]'
}

export function getIconSet(style: IconStyle): IconSet {
  switch (style) {
    case 'nerd-font':
      return nerdFontIcons
    case 'unicode':
      return unicodeIcons
    case 'ascii':
      return asciiIcons
    case 'emoji':
    default:
      return emojiIcons
  }
}