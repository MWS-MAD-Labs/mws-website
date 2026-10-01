import { useEditorState, type Editor } from '@tiptap/react';
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';

type TiptapToolbarProps = {
  editor: Editor;
};

function ToolbarButton({
  active = false,
  disabled = false,
  icon: Icon,
  label,
  shortcut,
  onClick,
}: {
  active?: boolean;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  onClick: () => void;
}) {
  const title = shortcut ? `${label} (${shortcut})` : label;

  return (
    <button
      type="button"
      title={title}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={[
        'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
        active ? 'bg-[#3C50E0] text-white' : 'text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#1C2434]',
        'disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent',
      ].join(' ')}
    >
      <Icon size={16} strokeWidth={2} />
    </button>
  );
}

function ToolbarDivider() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px bg-[#E2E8F0]" />;
}

const MOD = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';

export default function TiptapToolbar({ editor }: TiptapToolbarProps) {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive('bold'),
      italic: current.isActive('italic'),
      underline: current.isActive('underline'),
      strike: current.isActive('strike'),
      paragraph: current.isActive('paragraph'),
      h2: current.isActive('heading', { level: 2 }),
      h3: current.isActive('heading', { level: 3 }),
      bulletList: current.isActive('bulletList'),
      orderedList: current.isActive('orderedList'),
      blockquote: current.isActive('blockquote'),
      link: current.isActive('link'),
      linkHref: (current.getAttributes('link').href as string | undefined) ?? '',
      canUndo: current.can().undo(),
      canRedo: current.can().redo(),
    }),
  });

  const [isEditingLink, setIsEditingLink] = useState(false);
  const [linkValue, setLinkValue] = useState('');

  function openLinkEditor() {
    setLinkValue(state.linkHref);
    setIsEditingLink(true);
  }

  function applyLink() {
    const href = linkValue.trim();
    const chain = editor.chain().focus().extendMarkRange('link');

    if (href) {
      chain.setLink({ href }).run();
    } else {
      chain.unsetLink().run();
    }

    setIsEditingLink(false);
  }

  return (
    <div className="border-b border-[#E2E8F0] bg-[#F1F5F9]">
      <div
        role="toolbar"
        aria-label="Text formatting"
        className="flex flex-wrap items-center gap-0.5 px-2 py-1.5"
      >
        <ToolbarButton
          icon={Pilcrow}
          label="Paragraph"
          active={state.paragraph}
          onClick={() => editor.chain().focus().setParagraph().run()}
        />
        <ToolbarButton
          icon={Heading2}
          label="Heading"
          active={state.h2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          icon={Heading3}
          label="Subheading"
          active={state.h3}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          icon={Bold}
          label="Bold"
          shortcut={`${MOD}+B`}
          active={state.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={Italic}
          label="Italic"
          shortcut={`${MOD}+I`}
          active={state.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={Underline}
          label="Underline"
          shortcut={`${MOD}+U`}
          active={state.underline}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <ToolbarButton
          icon={Strikethrough}
          label="Strikethrough"
          active={state.strike}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          icon={List}
          label="Bulleted list"
          active={state.bulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={ListOrdered}
          label="Numbered list"
          active={state.orderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          icon={Quote}
          label="Quote"
          active={state.blockquote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          icon={Minus}
          label="Divider line"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />

        <ToolbarDivider />

        <ToolbarButton
          icon={Link2}
          label={state.link ? 'Edit link' : 'Add link'}
          active={state.link || isEditingLink}
          onClick={openLinkEditor}
        />
        <ToolbarButton
          icon={Link2Off}
          label="Remove link"
          disabled={!state.link}
          onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}
        />

        <div className="ml-auto flex items-center gap-0.5">
          <ToolbarButton
            icon={Undo2}
            label="Undo"
            shortcut={`${MOD}+Z`}
            disabled={!state.canUndo}
            onClick={() => editor.chain().focus().undo().run()}
          />
          <ToolbarButton
            icon={Redo2}
            label="Redo"
            shortcut={`${MOD}+Shift+Z`}
            disabled={!state.canRedo}
            onClick={() => editor.chain().focus().redo().run()}
          />
        </div>
      </div>

      {/* Not a <form>: editors often sit inside a page form, and a nested
          submit would bubble up and save the whole page. */}
      {isEditingLink ? (
        <div
          role="group"
          aria-label="Link"
          className="flex flex-wrap items-center gap-2 border-t border-[#E2E8F0] bg-white px-3 py-2"
        >
          <label className="text-xs font-medium text-[#64748B]" htmlFor="tiptap-link-input">
            Link URL
          </label>
          <input
            id="tiptap-link-input"
            autoFocus
            type="text"
            inputMode="url"
            placeholder="https://… or /page"
            value={linkValue}
            onChange={(event) => setLinkValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applyLink();
              }
              if (event.key === 'Escape') setIsEditingLink(false);
            }}
            className="min-w-[220px] flex-1 rounded-md border border-[#E2E8F0] px-2.5 py-1.5 text-sm outline-none focus:border-[#3C50E0]"
          />
          <button
            type="button"
            onClick={applyLink}
            className="rounded-md bg-[#3C50E0] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2F3EC8]"
          >
            {linkValue.trim() ? 'Apply' : 'Remove link'}
          </button>
          <button
            type="button"
            onClick={() => setIsEditingLink(false)}
            className="rounded-md px-3 py-1.5 text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9]"
          >
            Cancel
          </button>
          <p className="w-full text-[11px] text-[#64748B]">
            Select text first, then add a link. Leave empty to remove it.
          </p>
        </div>
      ) : null}
    </div>
  );
}
