import { moveItem } from '../../utils/contactPageEditorUtils';
import { AddRowButton, RowActions, SectionCard, TextField } from './ContactEditorControls';
import type { ContactEditorSectionProps } from './types';

type OfficeHourItem = ContactEditorSectionProps['content']['officeHours']['items'][number];

const rowInputClass =
  'h-10 w-full min-w-0 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#3C50E0]';

export default function OfficeHours({
  content,
  isBusy = false,
  updateContent,
}: ContactEditorSectionProps) {
  const items = content.officeHours.items;

  function setItems(next: OfficeHourItem[]) {
    updateContent((current) => ({
      ...current,
      officeHours: { ...current.officeHours, items: next },
    }));
  }

  function updateItem(index: number, patch: Partial<OfficeHourItem>) {
    setItems(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  return (
    <SectionCard
      number="05"
      title="Office Hours"
      description="The third column of the Get in Touch section."
    >
      <TextField
        label="Title"
        disabled={isBusy}
        value={content.officeHours.title}
        placeholder="Office Hours"
        onChange={(value) =>
          updateContent((current) => ({
            ...current,
            officeHours: { ...current.officeHours, title: value },
          }))
        }
      />

      <div>
        <div className="hidden grid-cols-[20px_minmax(0,1fr)_minmax(0,1.4fr)_auto] gap-2 text-sm font-semibold text-[#1C2434] sm:grid">
          <span />
          <span>Day</span>
          <span>Hours</span>
          <span className="w-[117px]" />
        </div>

        <ol className="mt-2 space-y-3 sm:space-y-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="grid grid-cols-[20px_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[20px_minmax(0,1fr)_minmax(0,1.4fr)_auto]"
            >
              <span className="text-right text-xs tabular-nums text-[#94A3B8]">{index + 1}</span>
              <input
                aria-label={`Day for row ${index + 1}`}
                disabled={isBusy}
                value={item.title}
                placeholder="e.g. Monday - Friday"
                onChange={(event) => updateItem(index, { title: event.currentTarget.value })}
                className={rowInputClass}
              />
              <input
                aria-label={`Hours for row ${index + 1}`}
                disabled={isBusy}
                value={item.text}
                placeholder="e.g. 07:30 AM - 04:00 PM"
                onChange={(event) => updateItem(index, { text: event.currentTarget.value })}
                className={`${rowInputClass} col-start-2 sm:col-start-auto`}
              />
              <div className="col-start-2 sm:col-start-auto">
                <RowActions
                  index={index}
                  count={items.length}
                  label={`office hours row ${index + 1}`}
                  disabled={isBusy}
                  onMove={(direction) => setItems(moveItem(items, index, direction))}
                  onRemove={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))}
                />
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-3">
          <AddRowButton
            label="Add row"
            disabled={isBusy}
            onClick={() => setItems([...items, { title: '', text: '' }])}
          />
        </div>
      </div>
    </SectionCard>
  );
}
