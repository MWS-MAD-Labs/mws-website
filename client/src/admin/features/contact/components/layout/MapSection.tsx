import { useEffect } from 'react';

import { LocationSummary, MapFrame } from '@/admin/features/settings/components/MapPreview';
import { SETTINGS_PATHS } from '@/admin/features/settings/settingsPaths';
import { parseMapEmbed } from '../../utils/contactPageEditorUtils';
import { SectionCard, TextField } from './ContactEditorControls';
import ManagedInSettings from './ManagedInSettings';
import type { ContactEditorSectionProps } from './types';

type MapSectionProps = ContactEditorSectionProps & {
  onPendingChange: (pending: boolean) => void;
};

export default function MapSection({
  content,
  isBusy = false,
  updateContent,
  onPendingChange,
}: MapSectionProps) {
  const currentCheck = parseMapEmbed(content.map.src);

  // The map location is chosen in Settings, so this page never has a pending map.
  useEffect(() => {
    onPendingChange(false);
  }, [onPendingChange]);

  return (
    <SectionCard
      number="06"
      title="Map"
      description="The Google Maps embed shown at the bottom of the Contact page."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Section title"
          disabled={isBusy}
          value={content.map.title}
          placeholder="Find Us"
          onChange={(value) =>
            updateContent((current) => ({ ...current, map: { ...current.map, title: value } }))
          }
        />
        <TextField
          label="Map description for screen readers"
          disabled={isBusy}
          value={content.map.titleAttr}
          placeholder="Millennia World School location map"
          onChange={(value) =>
            updateContent((current) => ({ ...current, map: { ...current.map, titleAttr: value } }))
          }
        />
      </div>

      <ManagedInSettings label="Map location" settingsPath={SETTINGS_PATHS.location}>
        {currentCheck.ok ? (
          <div className="grid gap-2">
            <MapFrame src={content.map.src} title={content.map.titleAttr || 'Current map'} />
            <LocationSummary src={content.map.src} />
          </div>
        ) : (
          <p className="text-[#B91C1C]">The saved map cannot be shown. {currentCheck.error}</p>
        )}
      </ManagedInSettings>
    </SectionCard>
  );
}
