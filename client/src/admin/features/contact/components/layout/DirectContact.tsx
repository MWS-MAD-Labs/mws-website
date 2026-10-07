import { SectionCard, TextField } from './ContactEditorControls';
import type { ContactEditorSectionProps } from './types';

type DirectContactKey = keyof ContactEditorSectionProps['content']['directContacts'];

export default function DirectContact({
  content,
  isBusy = false,
  updateContent,
}: ContactEditorSectionProps) {
  function update(key: DirectContactKey, value: string) {
    updateContent((current) => ({
      ...current,
      directContacts: { ...current.directContacts, [key]: value },
    }));
  }

  return (
    <SectionCard
      number="03"
      title="Contact Information"
      description="The first column of the Get in Touch section. Admissions and Book a Tour also use this WhatsApp number."
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
        <TextField
          label="Phone"
          type="tel"
          disabled={isBusy}
          value={content.directContacts.phone}
          placeholder="+62 21-7463-3333"
          onChange={(value) => update('phone', value)}
        />
        <TextField
          label="WhatsApp"
          type="tel"
          hint="Include the country code, e.g. +62."
          disabled={isBusy}
          value={content.directContacts.whatsapp}
          placeholder="+62 812-0000-0000"
          onChange={(value) => update('whatsapp', value)}
        />
        <TextField
          label="Email"
          type="email"
          disabled={isBusy}
          value={content.directContacts.email}
          placeholder="info@millennia21.id"
          onChange={(value) => update('email', value)}
        />
      </div>
    </SectionCard>
  );
}
