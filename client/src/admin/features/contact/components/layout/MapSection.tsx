import { MapPin } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import Button from '@/admin/components/ui/Button';
import { parseMapEmbed, readMapLocation } from '../../utils/contactPageEditorUtils';
import { SectionCard, TextField } from './ContactEditorControls';
import type { ContactEditorSectionProps } from './types';

type MapSectionProps = ContactEditorSectionProps & {
  onPendingChange: (pending: boolean) => void;
};

function LocationSummary({ src }: { src: string }) {
  const location = readMapLocation(src);
  const hasCoordinates = location.lat !== null && location.lng !== null;
  const mapsLink = hasCoordinates
    ? `https://www.google.com/maps?q=${location.lat},${location.lng}`
    : null;

  return (
    <div className="flex flex-wrap items-start justify-between gap-2 text-sm">
      <div className="flex min-w-0 items-start gap-2">
        <MapPin size={16} className="mt-0.5 shrink-0 text-[#3C50E0]" />
        <div className="min-w-0">
          <p className="font-medium text-[#1C2434]">{location.name || 'Unnamed location'}</p>
          {hasCoordinates ? (
            <p className="text-xs tabular-nums text-[#64748B]">
              {location.lat?.toFixed(5)}, {location.lng?.toFixed(5)}
            </p>
          ) : null}
        </div>
      </div>
      {mapsLink ? (
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-[#3C50E0] hover:underline"
        >
          Open in Google Maps
        </a>
      ) : null}
    </div>
  );
}

function MapFrame({ src, title }: { src: string; title: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-[#E2E8F0] bg-[#F1F5F9]">
      <iframe
        key={src}
        src={src}
        title={title}
        className="block h-[280px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default function MapSection({
  content,
  isBusy = false,
  updateContent,
  onPendingChange,
}: MapSectionProps) {
  const [draft, setDraft] = useState('');
  const parsed = useMemo(() => (draft.trim() ? parseMapEmbed(draft) : null), [draft]);
  const currentCheck = useMemo(() => parseMapEmbed(content.map.src), [content.map.src]);
  const isSameAsCurrent = parsed?.ok && parsed.src === content.map.src;
  const hasPending = Boolean(draft.trim()) && !isSameAsCurrent;

  useEffect(() => {
    onPendingChange(hasPending);
  }, [hasPending, onPendingChange]);

  function applyDraft() {
    if (!parsed?.ok) return;
    updateContent((current) => ({ ...current, map: { ...current.map, src: parsed.src } }));
    setDraft('');
  }

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

      <div className="grid gap-2">
        <p className="text-sm font-semibold text-[#1C2434]">Current location</p>
        {currentCheck.ok ? (
          <>
            <MapFrame src={content.map.src} title={content.map.titleAttr || 'Current map'} />
            <LocationSummary src={content.map.src} />
          </>
        ) : (
          <p className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">
            The saved map cannot be shown. {currentCheck.error}
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
          value={draft}
          placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'
          onChange={(event) => setDraft(event.currentTarget.value)}
          className="w-full resize-y rounded-md border border-[#E2E8F0] bg-white px-3 py-2.5 font-mono text-xs leading-5 text-[#1C2434] outline-none focus:border-[#3C50E0]"
        />

        {parsed && !parsed.ok ? (
          <p role="alert" className="text-sm text-[#B91C1C]">
            {parsed.error}
          </p>
        ) : null}

        {parsed?.ok && isSameAsCurrent ? (
          <p className="text-sm text-[#64748B]">This is the location already in use.</p>
        ) : null}

        {parsed?.ok && !isSameAsCurrent ? (
          <div className="grid gap-3">
            <MapFrame src={parsed.src} title="New map preview" />
            <LocationSummary src={parsed.src} />
            <div className="flex flex-wrap gap-2">
              <Button disabled={isBusy} size="sm" type="button" onClick={applyDraft}>
                Use this location
              </Button>
              <Button
                disabled={isBusy}
                size="sm"
                type="button"
                variant="ghost"
                onClick={() => setDraft('')}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {hasPending ? (
          <p className="text-xs text-[#B45309]">
            The new map is not applied yet. Use this location or cancel before saving the page.
          </p>
        ) : null}
      </div>
    </SectionCard>
  );
}
