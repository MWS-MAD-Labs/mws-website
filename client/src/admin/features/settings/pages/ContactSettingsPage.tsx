import { SectionCard, TextField } from '@/admin/features/contact/components/layout/ContactEditorControls';
import type { SiteSettings } from '@/features/site-settings/siteSettingsData';
import SettingsPageShell from '../components/SettingsPageShell';
import { useSiteSettingsSection } from '../hooks/useSiteSettingsSection';

type ContactSettings = SiteSettings['contact'];

function clean(value: ContactSettings): ContactSettings {
  return {
    phone: value.phone.trim(),
    whatsapp: value.whatsapp.trim(),
    email: value.email.trim(),
  };
}

function validate(value: ContactSettings) {
  if (!value.phone) return 'Phone is required.';
  if (!value.whatsapp) return 'WhatsApp is required.';
  if (value.whatsapp.replace(/\D/g, '').length < 8) return 'WhatsApp number is too short.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) return 'Email is not a valid address.';
  return null;
}

export default function ContactSettingsPage() {
  const section = useSiteSettingsSection('contact', {
    clean,
    validate,
    successMessage: 'Contact settings saved.',
  });
  const { isBusy, setValue, value } = section;

  function update(key: keyof ContactSettings, next: string) {
    setValue((current) => ({ ...current, [key]: next }));
  }

  return (
    <SettingsPageShell
      title="Contact"
      description="Phone, WhatsApp and email used across the public website."
      usedOn={[
        'Contact page: Get in Touch',
        'Admission page: WhatsApp buttons',
        'Book a Tour: WhatsApp button',
        'Footer: email',
      ]}
      section={section}
    >
      <SectionCard
        number="01"
        title="Contact Numbers & Email"
        description="Admissions and Book a Tour open WhatsApp with this number."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Phone"
            type="tel"
            disabled={isBusy}
            value={value.phone}
            placeholder="+62 21-7463-3333"
            onChange={(next) => update('phone', next)}
          />
          <TextField
            label="WhatsApp"
            type="tel"
            hint="Include the country code, e.g. +62."
            disabled={isBusy}
            value={value.whatsapp}
            placeholder="+62 812-0000-0000"
            onChange={(next) => update('whatsapp', next)}
          />
          <TextField
            label="Email"
            type="email"
            disabled={isBusy}
            value={value.email}
            placeholder="info@millennia21.id"
            onChange={(next) => update('email', next)}
          />
        </div>
      </SectionCard>
    </SettingsPageShell>
  );
}
