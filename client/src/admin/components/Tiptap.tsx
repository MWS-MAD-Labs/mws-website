import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import { useEffect, useRef } from 'react';

import TiptapToolbar from './TiptapToolbar';
import { ArticleImage, insertTiptapImage, type TiptapImageOptions } from './tiptapImage';

function imageFiles(list: FileList | null | undefined) {
  return Array.from(list ?? []).filter((file) => file.type.startsWith('image/'));
}

type TiptapSize = 'compact' | 'default' | 'article';

type TiptapProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** compact: short paragraphs and FAQ answers, article: full news stories. */
  size?: TiptapSize;
  ariaLabel?: string;
  images?: TiptapImageOptions;
};

const MIN_HEIGHT: Record<TiptapSize, string> = {
  compact: 'min-h-[96px]',
  default: 'min-h-[160px]',
  article: 'min-h-[360px]',
};

export default function Tiptap({
  value,
  onChange,
  placeholder = 'Start writing…',
  size = 'default',
  ariaLabel,
  images,
}: TiptapProps) {
  // Read inside editor callbacks, which are created once with the editor.
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const editorRef = useRef<Editor | null>(null);

  async function uploadFiles(target: Editor, files: File[]) {
    const options = imagesRef.current;
    if (!options) return;

    for (const file of files) {
      try {
        insertTiptapImage(target, await options.onUploadFile(file));
      } catch (error) {
        options.onError?.(error instanceof Error ? error.message : 'Failed to upload image.');
      }
    }
  }

  const editor = useEditor({
    extensions: [
      // The server sanitizer drops <code>, so the editor does not offer it.
      StarterKit.configure({
        code: false,
        codeBlock: false,
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https',
        },
      }),
      Placeholder.configure({ placeholder }),
      ...(images ? [ArticleImage] : []),
    ],
    content: value,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    editorProps: {
      handlePaste: (_view, event) => {
        const files = imageFiles(event.clipboardData?.files);
        if (!imagesRef.current || !files.length || !editorRef.current) return false;
        void uploadFiles(editorRef.current, files);
        return true;
      },
      handleDrop: (_view, event, _slice, moved) => {
        const files = imageFiles(event.dataTransfer?.files);
        if (moved || !imagesRef.current || !files.length || !editorRef.current) return false;
        event.preventDefault();
        void uploadFiles(editorRef.current, files);
        return true;
      },
      // Pictures copied from another page would vanish on save, because the
      // server only keeps uploaded ones. Drop them now so what you see is
      // what gets published.
      transformPastedHTML: (html) => {
        const options = imagesRef.current;
        if (!options) return html;
        const doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('img').forEach((img) => {
          if (!options.isAllowedSrc(img.getAttribute('src') ?? '')) img.remove();
        });
        return doc.body.innerHTML;
      },
      attributes: {
        class: ['cms-rich-text', MIN_HEIGHT[size], 'px-4 py-3 outline-none'].join(' '),
        ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
      },
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const currentContent = editor.getHTML();

    if (currentContent !== value) {
      editor.commands.setContent(value || '<p></p>', {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div
        className={`flex ${MIN_HEIGHT[size]} items-center justify-center rounded-lg border border-[#E2E8F0] text-sm text-[#64748B]`}
      >
        Loading editor…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white transition-colors focus-within:border-[#3C50E0] focus-within:ring-2 focus-within:ring-[#3C50E0]/10">
      <TiptapToolbar editor={editor} images={images} />

      <EditorContent editor={editor} />
    </div>
  );
}
