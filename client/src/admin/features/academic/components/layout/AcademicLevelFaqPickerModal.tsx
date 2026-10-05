import Button from '@/admin/components/ui/Button';
import Modal from '@/admin/components/ui/Modal';
import SearchInput from '@/admin/components/ui/SearchInput';
import type { AcademicLevelEditorState } from '../../hooks/useAcademicLevelEditor';

type AcademicLevelFaqPickerModalProps = {
  editor: AcademicLevelEditorState;
};

export default function AcademicLevelFaqPickerModal({
  editor,
}: AcademicLevelFaqPickerModalProps) {
  const {
    attachFaq,
    availableFaqs,
    config,
    faqSearch,
    filteredAvailableFaqs,
    isBusy,
    isFaqPickerOpen,
    setFaqSearch,
    setIsFaqPickerOpen,
  } = editor;

  return (
    <Modal
      open={isFaqPickerOpen}
      title={`Select FAQ for ${config.title}`}
      onClose={() => {
        if (isBusy) return;
        setIsFaqPickerOpen(false);
        setFaqSearch('');
      }}
    >
      <div className="grid gap-4">
        <SearchInput
          placeholder="Search active FAQ..."
          value={faqSearch}
          onChange={(event) => setFaqSearch(event.target.value)}
        />

        {filteredAvailableFaqs.length ? (
          <div className="max-h-[420px] divide-y divide-[#E2E8F0] overflow-y-auto rounded-lg border border-[#E2E8F0]">
            {filteredAvailableFaqs.map((faq) => (
              <article className="grid gap-3 p-4" key={faq.id}>
                <div>
                  <p className="text-sm font-semibold text-[#1C2434]">{faq.question}</p>
                  <p className="mt-2 text-sm leading-6 text-[#64748B]">{faq.answer}</p>
                </div>
                <div className="flex justify-end">
                  <Button
                    disabled={isBusy}
                    size="sm"
                    type="button"
                    onClick={() => void attachFaq(faq.id)}
                  >
                    Attach
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#E2E8F0] p-6 text-center text-sm text-[#64748B]">
            {availableFaqs.length
              ? 'No active FAQ matches your search.'
              : 'No active FAQ available to attach.'}
          </div>
        )}
      </div>
    </Modal>
  );
}
