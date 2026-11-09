import { SETTINGS_PATHS } from '@/admin/features/settings/settingsPaths';
import { SectionCard, TextField } from './ContactEditorControls';
import ManagedInSettings from './ManagedInSettings';
import type { ContactEditorSectionProps } from './types';

export default function OfficeHours({
  content,
  isBusy = false,
  updateContent,
}: ContactEditorSectionProps) {
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

      <ManagedInSettings label="Office hours" settingsPath={SETTINGS_PATHS.officeHours}>
        <dl className="grid gap-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          {content.officeHours.items.map((item, index) => (
            <div key={index} className="contents">
              <dt className="text-[#64748B]">{item.title}</dt>
              <dd>{item.text}</dd>
            </div>
          ))}
        </dl>
      </ManagedInSettings>
    </SectionCard>
  );
}
