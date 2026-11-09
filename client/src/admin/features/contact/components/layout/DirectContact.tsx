import { SETTINGS_PATHS } from '@/admin/features/settings/settingsPaths';
import { SectionCard, TextField } from './ContactEditorControls';
import ManagedInSettings from './ManagedInSettings';
import type { ContactEditorSectionProps } from './types';

type DirectContactCopyKey = 'title' | 'heading';

export default function DirectContact({
  content,
  isBusy = false,
  updateContent,
}: ContactEditorSectionProps) {
  function update(key: DirectContactCopyKey, value: string) {
    updateContent((current) => ({
      ...current,
      directContacts: { ...current.directContacts, [key]: value },
    }));
  }

  return (
    <SectionCard
      number="03"
      title="Contact Information"
      description="The first column of the Get in Touch section."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Section title"
          disabled={isBusy}
          value={content.directContacts.title}
          placeholder="Get in Touch"
          onChange={(value) => update('title', value)}
        />
        <TextField
          label="Heading"
          disabled={isBusy}
          value={content.directContacts.heading}
          placeholder="Administration & Admission:"
          onChange={(value) => update('heading', value)}
        />
      </div>

      <ManagedInSettings label="Phone, WhatsApp & email" settingsPath={SETTINGS_PATHS.contact}>
        <dl className="grid gap-1 sm:grid-cols-[96px_minmax(0,1fr)]">
          <dt className="text-[#64748B]">Phone</dt>
          <dd className="break-words">{content.directContacts.phone}</dd>
          <dt className="text-[#64748B]">WhatsApp</dt>
          <dd className="break-words">{content.directContacts.whatsapp}</dd>
          <dt className="text-[#64748B]">Email</dt>
          <dd className="break-words">{content.directContacts.email}</dd>
        </dl>
      </ManagedInSettings>
    </SectionCard>
  );
}
