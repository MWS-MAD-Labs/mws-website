import { MapPin } from 'lucide-react';
import { readMapLocation } from '@/admin/features/contact/utils/contactPageEditorUtils';

export function LocationSummary({ src }: { src: string }) {
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

export function MapFrame({ src, title }: { src: string; title: string }) {
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
