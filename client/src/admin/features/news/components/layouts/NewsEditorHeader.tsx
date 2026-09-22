import { ArrowLeft } from 'lucide-react';

export default function NewsEditorHeader({
  isEditing,
  onClose,
}: {
  isEditing: boolean;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <button
        aria-label="Back to news"
        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-[#7e1518]/30 hover:text-[#7e1518]"
        type="button"
        onClick={onClose}
      >
        <ArrowLeft size={17} />
      </button>

      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          {isEditing ? 'Edit news post' : 'Create a news post'}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          {isEditing
            ? 'Update the article content and publication settings.'
            : 'Write a story and save it as a draft or publish it.'}
        </p>
      </div>
    </div>
  );
}
