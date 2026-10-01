import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import { useEffect } from 'react';

import TiptapToolbar from './TiptapToolbar';

type TiptapSize = 'compact' | 'default' | 'article';

type TiptapProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** compact: short paragraphs and FAQ answers, article: full news stories. */
  size?: TiptapSize;
  ariaLabel?: string;
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
}: TiptapProps) {
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
    ],
    content: value,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    editorProps: {
      attributes: {
        class: ['cms-rich-text', MIN_HEIGHT[size], 'px-4 py-3 outline-none'].join(' '),
        ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
      },
    },
  });

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
      <TiptapToolbar editor={editor} />

      <EditorContent editor={editor} />
    </div>
  );
}
