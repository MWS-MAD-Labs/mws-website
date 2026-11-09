import { SETTINGS_PATHS } from '@/admin/features/settings/settingsPaths';
import { SectionCard, TextField } from './ContactEditorControls';
import ManagedInSettings from './ManagedInSettings';
import type { ContactEditorSectionProps } from './types';

export default function CampusInfo({
  content,
  isBusy = false,
  updateContent,
}: ContactEditorSectionProps) {
  return (
    <SectionCard
      number="04"
      title="Address"
      description="The second column of the Get in Touch section."
    >
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

      <ManagedInSettings label="School name & address" settingsPath={SETTINGS_PATHS.location}>
        <p className="font-medium">{content.address.name}</p>
        {content.address.lines.map((line, index) => (
          <p key={index} className="text-[#64748B]">
            {line}
          </p>
        ))}
      </ManagedInSettings>
    </SectionCard>
  );
}
