import { useEditor, EditorContent } from "@tiptap/react";
import { AnyExtension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

// Global type augmentations for Tiptap & Prosemirror commands
import "@tiptap/core";
import "@tiptap/extension-history"; 

import { Audio } from "../extensions/AudioExtension";
import { Video } from "../extensions/VideoExtension";
import { YouTubeEmbed } from "../extensions/YouTubeExtension";
import { useRef, useMemo } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Use useMemo to wrap the configuration tuple and assert the flat AnyExtension baseline
  const extensionsList = useMemo(() => [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Image.configure({
      inline: false,
      allowBase64: false,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { rel: "noopener noreferrer" },
    }),
    Placeholder.configure({
      placeholder: "Start writing your post…",
    }),
    Audio,
    Video,
    YouTubeEmbed,
  ] as AnyExtension[], []);

  const editor = useEditor({
    extensions: extensionsList,
    content: value || "",
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "tiptap-editor",
        spellcheck: "true",
      },
    },
  });

  if (!editor) {
    return <div className="tiptap-loading">Loading editor…</div>;
  }

  const setLink = () => {
    const previousUrl = (editor.getAttributes("link").href as string | undefined) || "";
    const url = window.prompt("Enter URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = () => imageInputRef.current?.click();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToR2(file);
    if (url) editor.chain().focus().setImage({ src: url }).run();
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const addAudio = () => audioInputRef.current?.click();

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToR2(file);
    if (url) editor.chain().focus().setAudio(url).run();
    if (audioInputRef.current) audioInputRef.current.value = "";
  };

  const addVideo = () => videoInputRef.current?.click();

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToR2(file);
    if (url) editor.chain().focus().setVideo(url).run();
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const addYoutube = () => {
    const input = window.prompt("Enter YouTube URL or video ID:");
    if (!input) return;
    editor.chain().focus().setYouTubeVideo(input).run();
  };

  async function uploadToR2(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = (await res.json()) as { url: string };
        return data.url;
      }
    } catch {
      // ignore
    }
    return null;
  }

  const isHeadingActive = (level: number) =>
    editor.isActive("heading", { level });

  return (
    <div className="tiptap-wrapper">
      <div className="tiptap-toolbar">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`tiptap-btn ${editor.isActive("bold") ? "active" : ""}`} title="Bold"><strong>B</strong></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`tiptap-btn ${editor.isActive("italic") ? "active" : ""}`} title="Italic"><em>I</em></button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={`tiptap-btn ${editor.isActive("strike") ? "active" : ""}`} title="Strikethrough"><s>S</s></button>
        <span className="tiptap-divider" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`tiptap-btn ${isHeadingActive(1) ? "active" : ""}`} title="Heading 1">H1</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`tiptap-btn ${isHeadingActive(2) ? "active" : ""}`} title="Heading 2">H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`tiptap-btn ${isHeadingActive(3) ? "active" : ""}`} title="Heading 3">H3</button>
        <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={`tiptap-btn ${editor.isActive("paragraph") ? "active" : ""}`} title="Paragraph">¶</button>
        <span className="tiptap-divider" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`tiptap-btn ${editor.isActive("bulletList") ? "active" : ""}`} title="Bullet list">• List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`tiptap-btn ${editor.isActive("orderedList") ? "active" : ""}`} title="Numbered list">1. List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`tiptap-btn ${editor.isActive("blockquote") ? "active" : ""}`} title="Quote">❝</button>
        <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} className={`tiptap-btn ${editor.isActive("code") ? "active" : ""}`} title="Inline code">{"</>"}</button>
        <span className="tiptap-divider" />
        <button type="button" onClick={setLink} className={`tiptap-btn ${editor.isActive("link") ? "active" : ""}`} title="Add link">🔗</button>
        <button type="button" onClick={addImage} className="tiptap-btn" title="Insert image (uploads to R2)">🖼️</button>
        <button type="button" onClick={addAudio} className="tiptap-btn" title="Insert audio (uploads to R2)">🎵</button>
        <button type="button" onClick={addVideo} className="tiptap-btn" title="Insert video (uploads to R2)">🎬</button>
        <button type="button" onClick={addYoutube} className="tiptap-btn" title="Embed YouTube video">▶</button>
        <span className="tiptap-divider" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className="tiptap-btn" title="Undo">↩</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className="tiptap-btn" title="Redo">↪</button>
      </div>
      <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: "none" }} />
      <input type="file" ref={audioInputRef} onChange={handleAudioUpload} accept="audio/*" style={{ display: "none" }} />
      <input type="file" ref={videoInputRef} onChange={handleVideoUpload} accept="video/*" style={{ display: "none" }} />
      <EditorContent editor={editor} />
    </div>
  );
}
