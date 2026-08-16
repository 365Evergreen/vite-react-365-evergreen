import { Node } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    audio: {
      setAudio: (src: string) => ReturnType;
    };
  }
}

export interface AudioOptions {
  HTMLAttributes: Record<string, unknown>;
}

export const Audio = Node.create<AudioOptions>({
  name: "audio",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (el) => el.getAttribute("src"),
        renderHTML: (attrs) => {
          if (!attrs.src) return {};
          return { src: attrs.src };
        },
      },
      controls: {
        default: true,
        renderHTML: () => ({ controls: "controls" }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "audio" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["audio", { ...HTMLAttributes, controls: "controls" }];
  },

  // Removed `: RawCommands` type annotation here to let Tiptap infer it automatically
  addCommands() {
    return {
      setAudio:
        (src: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { src },
          });
        },
    };
  },
});
