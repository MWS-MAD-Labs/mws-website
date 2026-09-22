import type { NewsTag } from '@/admin/api/adminApi';
import EditorSection from './EditorSection';

export default function TagsSection({
  selectedTagIds,
  tags,
  onToggleTag,
}: {
  selectedTagIds: string[];
  tags: NewsTag[];
  onToggleTag: (tagId: string) => void;
}) {
  return (
    <EditorSection title="Tags" description="Select all tags that apply.">
      <div className="p-5">
        {!tags.length ? (
          <p className="text-sm text-gray-500">No news tags available.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  aria-pressed={isSelected}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'border-[#7e1518] bg-[#7e1518] text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-[#7e1518]/40 hover:text-[#7e1518]'
                  }`}
                  key={tag.id}
                  type="button"
                  onClick={() => onToggleTag(tag.id)}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </EditorSection>
  );
}
