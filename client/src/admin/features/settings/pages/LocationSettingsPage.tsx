import { useMemo, useState } from 'react';
import Button from '@/admin/components/ui/Button';
import {
  AddRowButton,
  RowActions,
  SectionCard,
  TextField,
} from '@/admin/features/contact/components/layout/ContactEditorControls';
import { moveItem, parseMapEmbed } from '@/admin/features/contact/utils/contactPageEditorUtils';
import type { SiteSettings } from '@/features/site-settings/siteSettingsData';
import { LocationSummary, MapFrame } from '../components/MapPreview';
import SettingsPageShell from '../components/SettingsPageShell';
import { useSiteSettingsSection } from '../hooks/useSiteSettingsSection';

type LocationSettings = SiteSettings['location'];

function clean(value: LocationSettings): LocationSettings {
  return {
    name: value.name.trim(),
    addressLines: value.addressLines.map((line) => line.trim()).filter(Boolean),
    mapEmbedSrc: value.mapEmbedSrc.trim(),
  };
}

function validate(value: LocationSettings) {
  if (!value.name) return 'School name is required.';
  if (!value.addressLines.length) return 'Add at least one address line.';

  const mapCheck = parseMapEmbed(value.mapEmbedSrc);
  if (!mapCheck.ok) return `Map: ${mapCheck.error}`;

  return null;
}

export default function LocationSettingsPage() {
  const section = useSiteSettingsSection('location', {
    clean,
    validate,
    successMessage: 'Address and map saved.',
  });
  const { isBusy, setValue, value } = section;
  const lines = value.addressLines;

  const [mapDraft, setMapDraft] = useState('');
  const parsedDraft = useMemo(
    () => (mapDraft.trim() ? parseMapEmbed(mapDraft) : null),
    [mapDraft],
  );
  const currentMap = useMemo(() => parseMapEmbed(value.mapEmbedSrc), [value.mapEmbedSrc]);
  const isDraftSameAsCurrent = parsedDraft?.ok && parsedDraft.src === value.mapEmbedSrc;
  const hasPendingMap = Boolean(mapDraft.trim()) && !isDraftSameAsCurrent;

  function setLines(next: string[]) {
    setValue((current) => ({ ...current, addressLines: next }));
  }

  function applyMapDraft() {
    if (!parsedDraft?.ok) return;
    setValue((current) => ({ ...current, mapEmbedSrc: parsedDraft.src }));
    setMapDraft('');
  }

  return (
    <SettingsPageShell
      title="Address & Maps"
      description="The campus address and Google Maps location."
      usedOn={['Contact page: Campus Address and map', 'Footer: address']}
      section={section}
    >
      <SectionCard
        number="01"
        title="Campus Address"
        description="Each address line is shown on its own row."
      >
        <TextField
          label="School name"
          disabled={isBusy}
          value={value.name}
          placeholder="Millennia World School"
          onChange={(next) => setValue((current) => ({ ...current, name: next }))}
        />

        <div>
          <p className="text-sm font-semibold text-[#1C2434]">
            Address lines<span className="ml-1 text-red-600">*</span>
          </p>

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
                    const next = event.currentTarget.value;
                    setLines(lines.map((item, lineIndex) => (lineIndex === index ? next : item)));
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
            <AddRowButton
              label="Add line"
              disabled={isBusy || lines.length >= 6}
              onClick={() => setLines([...lines, ''])}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        number="02"
        title="Google Maps"
        description="The map embedded on the Contact page."
      >
        <div className="grid gap-2">
          <p className="text-sm font-semibold text-[#1C2434]">Current location</p>
          {currentMap.ok ? (
            <>
              <MapFrame src={value.mapEmbedSrc} title="Current campus map" />
              <LocationSummary src={value.mapEmbedSrc} />
            </>
          ) : (
            <p className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">
              The saved map cannot be shown. {currentMap.error}
            </p>
          )}
        </div>

        <div className="grid gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div>
            <p className="text-sm font-semibold text-[#1C2434]">Change location</p>
            <p className="mt-0.5 text-xs text-[#64748B]">
              In Google Maps, open the place, choose Share → Embed a map → Copy HTML, and paste it
              below. Check the preview, then apply it.
            </p>
          </div>

          <textarea
            aria-label="Google Maps embed code"
            disabled={isBusy}
            rows={3}
            value={mapDraft}
            placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'
            onChange={(event) => setMapDraft(event.currentTarget.value)}
            className="w-full resize-y rounded-md border border-[#E2E8F0] bg-white px-3 py-2.5 font-mono text-xs leading-5 text-[#1C2434] outline-none focus:border-[#3C50E0]"
          />

          {parsedDraft && !parsedDraft.ok ? (
            <p role="alert" className="text-sm text-[#B91C1C]">
              {parsedDraft.error}
            </p>
          ) : null}

          {parsedDraft?.ok && isDraftSameAsCurrent ? (
            <p className="text-sm text-[#64748B]">This is the location already in use.</p>
          ) : null}

          {parsedDraft?.ok && !isDraftSameAsCurrent ? (
            <div className="grid gap-3">
              <MapFrame src={parsedDraft.src} title="New map preview" />
              <LocationSummary src={parsedDraft.src} />
              <div className="flex flex-wrap gap-2">
                <Button disabled={isBusy} size="sm" type="button" onClick={applyMapDraft}>
                  Use this location
                </Button>
                <Button
                  disabled={isBusy}
                  size="sm"
                  type="button"
                  variant="ghost"
                  onClick={() => setMapDraft('')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}

          {hasPendingMap ? (
            <p className="text-xs text-[#B45309]">
              The new map is not applied yet. Use this location or cancel before saving.
            </p>
          ) : null}
        </div>
      </SectionCard>
    </SettingsPageShell>
  );
}
