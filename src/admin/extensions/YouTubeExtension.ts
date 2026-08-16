import { Node } from "@tiptap/core";

// 1. Register the setYouTubeVideo command globally
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    youtube: {
      setYouTubeVideo: (input: string) => ReturnType;
    };
  }
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  return null;
}

export const YouTubeEmbed = Node.create({
  name: "youtube",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      videoId: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-youtube"),
        renderHTML: (attrs) => {
          if (!attrs.videoId) return {};
          return { "data-youtube": attrs.videoId };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-youtube]" }];
  },

  // 2. Used Tiptap's built-in Node type instead of 'any'
  renderHTML({ node }) {
    const videoId = node.attrs.videoId as string | undefined;
    if (!videoId) return ["div", {}];

    return [
      "div",
      { "data-youtube": videoId, class: "youtube-embed" },
      [
        "iframe",
        {
          src: `https://www.youtube.com/embed/${videoId}`,
          width: "100%",
          height: "400",
          frameborder: "0",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          allowfullscreen: "true",
        },
      ],
    ];
  },

  // 3. Removed types inside commands block to allow clean inference without "as any"
  addCommands() {
    return {
      setYouTubeVideo:
        (input: string) =>
        ({ commands }) => {
          const videoId = extractYouTubeId(input);
          if (!videoId) return false;
          return commands.insertContent({
            type: this.name,
            attrs: { videoId },
          });
        },
    };
  },
});
