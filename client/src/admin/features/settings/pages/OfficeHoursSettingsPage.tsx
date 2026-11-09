import {
  AddRowButton,
  RowActions,
  SectionCard,
} from '@/admin/features/contact/components/layout/ContactEditorControls';
import { moveItem } from '@/admin/features/contact/utils/contactPageEditorUtils';
import type { SiteSettings } from '@/features/site-settings/siteSettingsData';
import SettingsPageShell from '../components/SettingsPageShell';
import { useSiteSettingsSection } from '../hooks/useSiteSettingsSection';

type OfficeHoursSettings = SiteSettings['officeHours'];
type OfficeHourItem = OfficeHoursSettings['items'][number];

const rowInputClass =
  'h-10 w-full min-w-0 rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#3C50E0]';

function clean(value: OfficeHoursSettings): OfficeHoursSettings {
  return {
    items: value.items
      .map((item) => ({ title: item.title.trim(), text: item.text.trim() }))
      .filter((item) => item.title || item.text),
  };
}

function validate(value: OfficeHoursSettings) {
  if (!value.items.length) return 'Add at least one row.';

  const incomplete = value.items.findIndex((item) => !item.title || !item.text);
  if (incomplete >= 0) return `Row ${incomplete + 1} needs both a day and hours.`;

  return null;
}

export default function OfficeHoursSettingsPage() {
  const section = useSiteSettingsSection('officeHours', {
    clean,
    validate,
    successMessage: 'Office hours saved.',
  });
  const { isBusy, setValue, value } = section;
  const items = value.items;

  function setItems(next: OfficeHourItem[]) {
    setValue({ items: next });
  }

  function updateItem(index: number, patch: Partial<OfficeHourItem>) {
    setItems(items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  return (
    <SettingsPageShell
      title="Office Hours"
      description="When the school office is open."
      usedOn={['Contact page: Office Hours']}
      section={section}
    >
      <SectionCard
        number="01"
        title="Office Hours"
        description="One row per day or range of days, shown in this order."
      >
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
    </SettingsPageShell>
  );
}
