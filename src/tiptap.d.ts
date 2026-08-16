import '@tiptap/core'
import '@tiptap/extension-bold'
import '@tiptap/extension-italic'
import '@tiptap/extension-strike'
import '@tiptap/extension-heading'
import '@tiptap/extension-paragraph'
import '@tiptap/extension-bullet-list'
import '@tiptap/extension-ordered-list'
import '@tiptap/extension-blockquote'
import '@tiptap/extension-code'
import '@tiptap/extension-history'
import '@tiptap/extension-link'
import '@tiptap/extension-image'

declare module '@tiptap/core' {
  interface ChainedCommands {
    // This forces TypeScript to always recognize these commands on .chain()
    toggleBold: () => ChainedCommands;
    toggleItalic: () => ChainedCommands;
    toggleStrike: () => ChainedCommands;
    toggleHeading: (attributes: { level: number }) => ChainedCommands;
    setParagraph: () => ChainedCommands;
    toggleBulletList: () => ChainedCommands;
    toggleOrderedList: () => ChainedCommands;
    toggleBlockquote: () => ChainedCommands;
    toggleCode: () => ChainedCommands;
    undo: () => ChainedCommands;
    redo: () => ChainedCommands;
    setAudio: (url:string) => ReturnType;
    setVideo: (url:string) => RemoveType;
  }
}
