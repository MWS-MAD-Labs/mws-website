import { moveItem } from '../../utils/contactPageEditorUtils';
import { AddRowButton, RowActions, SectionCard, TextField } from './ContactEditorControls';
import type { ContactEditorSectionProps } from './types';

export default function CampusInfo({
  content,
  isBusy = false,
  updateContent,
}: ContactEditorSectionProps) {
  const lines = content.address.lines;

  function setLines(next: string[]) {
    updateContent((current) => ({ ...current, address: { ...current.address, lines: next } }));
  }

  return (
    <SectionCard
      number="04"
      title="Address"
      description="The second column of the Get in Touch section."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Title"
          disabled={isBusy}
          value={content.address.title}
          placeholder="Campus Address"
          onChange={(value) =>
            updateContent((current) => ({
              ...current,
              address: { ...current.address, title: value },
            }))
          }
        />
        <TextField
          label="School name"
          disabled={isBusy}
          value={content.address.name}
          placeholder="Millennia World School"
          onChange={(value) =>
            updateContent((current) => ({
              ...current,
              address: { ...current.address, name: value },
            }))
          }
        />
      </div>

      <div>
        <p className="text-sm font-semibold text-[#1C2434]">Address lines</p>
        <p className="mt-0.5 text-xs text-[#64748B]">Each line is shown on its own row.</p>

        <ol className="mt-3 space-y-2">
          {lines.map((line, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-right text-xs tabular-nums text-[#94A3B8]">
                {index + 1}
              </span>
              <input
                aria-label={`Address line ${index + 1}`}
                disabled={isBusy}
                value={line}
                placeholder="e.g. Jl. Merpati Raya No. 103, Ciputat"
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  setLines(lines.map((item, lineIndex) => (lineIndex === index ? value : item)));
                }}
                className="h-10 min-w-0 flex-1 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#3C50E0]"
              />
              <RowActions
                index={index}
                count={lines.length}
                label={`address line ${index + 1}`}
                disabled={isBusy}
                onMove={(direction) => setLines(moveItem(lines, index, direction))}
                onRemove={() => setLines(lines.filter((_, lineIndex) => lineIndex !== index))}
              />
            </li>
          ))}
        </ol>

        <div className="mt-3">
          <AddRowButton label="Add line" disabled={isBusy} onClick={() => setLines([...lines, ''])} />
        </div>
      </div>
    </SectionCard>
  );
}
