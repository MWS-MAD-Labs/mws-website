// UNUSED — SAFE TO DELETE: tag selection is now rendered inside PublicationSection for the active CreateUpdateNews page.
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
          <p className="text-sm text-[#64748B]">No news tags available.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  aria-pressed={isSelected}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'border-[#3C50E0] bg-[#3C50E0] text-white'
                      : 'border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#3C50E0]/40 hover:text-[#3C50E0]'
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
