import { SectionCard, TextField } from '@/admin/features/contact/components/layout/ContactEditorControls';
import {
  SOCIAL_PLATFORMS,
  type SiteSettings,
  type SocialPlatform,
} from '@/features/site-settings/siteSettingsData';
import SettingsPageShell from '../components/SettingsPageShell';
import { useSiteSettingsSection } from '../hooks/useSiteSettingsSection';

type SocialSettings = SiteSettings['social'];

function clean(value: SocialSettings): SocialSettings {
  return Object.fromEntries(
    SOCIAL_PLATFORMS.map(({ key }) => [key, value[key].trim()]),
  ) as SocialSettings;
}

function validate(value: SocialSettings) {
  for (const { key, label } of SOCIAL_PLATFORMS) {
    const link = value[key];
    if (!link) continue;

    try {
      if (new URL(link).protocol !== 'https:') return `${label} must start with https://.`;
    } catch {
      return `${label} must be a full link starting with https://.`;
    }
  }

  return null;
}

export default function SocialSettingsPage() {
  const section = useSiteSettingsSection('social', {
    clean,
    validate,
    successMessage: 'Social media links saved.',
  });
  const { isBusy, setValue, value } = section;

  function update(key: SocialPlatform, next: string) {
    setValue((current) => ({ ...current, [key]: next }));
  }

  return (
    <SettingsPageShell
      title="Social Media"
      description="Links to the school's social media accounts."
      usedOn={['Footer: Follow Us (only filled links are shown)']}
      section={section}
    >
      <SectionCard
        number="01"
        title="Social Media Links"
        description="Paste the full link to each profile. Leave a field empty to hide it."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {SOCIAL_PLATFORMS.map((platform) => (
            <TextField
              key={platform.key}
              label={platform.label}
              required={false}
              disabled={isBusy}
              value={value[platform.key]}
              placeholder={platform.placeholder}
              onChange={(next) => update(platform.key, next)}
            />
          ))}
        </div>
      </SectionCard>
    </SettingsPageShell>
  );
}
