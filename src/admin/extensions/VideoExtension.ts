import { Node } from "@tiptap/core";

// 1. Register the setVideo command globally in Tiptap's command chain
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    video: {
      setVideo: (src: string) => ReturnType;
    };
  }
}

export interface VideoOptions {
  // Replaced 'any' with 'unknown' to satisfy ESLint
  HTMLAttributes: Record<string, unknown>;
}

export const Video = Node.create<VideoOptions>({
  name: "video",
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
    return [{ tag: "video" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["video", { ...HTMLAttributes, controls: "controls" }];
  },

  // 2. Let Tiptap infer the return type naturally without "as any"
  addCommands() {
    return {
      setVideo:
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
