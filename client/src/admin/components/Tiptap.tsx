import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

import TiptapToolbar from './TiptapToolbar';

type TiptapProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function Tiptap({ value, onChange }: TiptapProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,

    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    editorProps: {
      attributes: {
        class: [
          'min-h-[420px]',
          'px-4',
          'py-4',
          'outline-none',
          'text-sm',
          'leading-7',
          'text-gray-700',
          'prose',
          'prose-gray',
          'max-w-none',
        ].join(' '),
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
      <div className="flex min-h-[420px] items-center justify-center text-sm text-gray-400">
        Loading editor...
      </div>
    );
  }

  return (
    <div>
      <TiptapToolbar editor={editor} />

      <EditorContent editor={editor} />
    </div>
  );
}
