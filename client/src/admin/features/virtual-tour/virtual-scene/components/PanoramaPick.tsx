import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ImagePlus, MapPin, RotateCcw, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { Viewer, type ClickData } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';

import type { GalleryItem, VirtualTourScene } from '@/admin/api/adminApi';
import type { GalleryAssetSelection } from '@/admin/features/gallery/components/GalleryAssetPickerModal';
import CoverImagePickerModal from '@/admin/features/news/components/layouts/CoverImagePickerModal';
import Button from '@/admin/components/ui/Button';
import Field from '@/admin/components/ui/Field';
import Select from '@/admin/components/ui/Select';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { apiClient } from '@/lib/api';
import { FIELD_CLASS } from '../../virtualTourUtils';
import type { HotspotForm } from '../sceneEditorModel';

type PanoramaImage = GalleryItem['images'][number];

type PanoramaPickProps = {
  scene: VirtualTourScene | null;
  galleries: GalleryItem[];
  selectedImage: PanoramaImage | undefined;
  previewUrl: string;
  isImagePickerOpen: boolean;
  isSaving: boolean;
  hotspotForm: HotspotForm | null;
  targetScenes: VirtualTourScene[];
  onToggleImagePicker: () => void;
  onCloseImagePicker: () => void;
  onSelectPanorama: (asset: GalleryAssetSelection) => void;
  onUploadLocalImage: (file: File) => void;
  onChooseCoordinate: (yaw: number, pitch: number) => void;
  onHotspotChange: (changes: Partial<HotspotForm>) => void;
  onCancelHotspot: () => void;
  onSaveHotspot: (event: FormEvent<HTMLFormElement>) => void;
};

const DRAFT_MARKER_ID = 'draft-hotspot';

function radiansToDegrees(value: number) {
  return Math.round(((value * 180) / Math.PI) * 100) / 100;
}

function degreesToPosition(yaw: number, pitch: number) {
  return {
    yaw: `${yaw}deg`,
    pitch: `${pitch}deg`,
  };
}

function draftMarkerHtml() {
  return `
    <div style="filter:drop-shadow(0 3px 5px rgba(0,0,0,.45));">
      <svg
        aria-hidden="true"
        width="42"
        height="48"
        viewBox="0 0 42 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 2C11.6 2 4 9.5 4 18.8C4 31.5 21 46 21 46C21 46 38 31.5 38 18.8C38 9.5 30.4 2 21 2Z"
          fill="#7E1518"
          stroke="white"
          stroke-width="3"
        />
        <circle cx="21" cy="19" r="6" fill="white" />
        <circle cx="21" cy="19" r="2.8" fill="#7E1518" />
      </svg>
    </div>
  `;
}

function renderDraftMarker(
  markers: MarkersPlugin,
  hotspot: Pick<HotspotForm, 'label' | 'pitch' | 'yaw'> | null,
  hasDraftMarker: boolean,
) {
  if (hasDraftMarker) {
    markers.removeMarker(DRAFT_MARKER_ID);
  }

  if (!hotspot) return false;

  markers.addMarker({
    id: DRAFT_MARKER_ID,
    position: degreesToPosition(hotspot.yaw, hotspot.pitch),
    html: draftMarkerHtml(),
    anchor: 'bottom center',
    tooltip: {
      content: hotspot.label.trim() || 'Hotspot baru',
      position: 'top',
    },
    size: {
      width: 42,
      height: 48,
    },
  });

  return true;
}

export default function PanoramaPick({
  scene,
  galleries,
  selectedImage,
  previewUrl,
  isImagePickerOpen,
  isSaving,
  hotspotForm,
  targetScenes,
  onToggleImagePicker,
  onCloseImagePicker,
  onSelectPanorama,
  onUploadLocalImage,
  onChooseCoordinate,
  onHotspotChange,
  onCancelHotspot,
  onSaveHotspot,
}: PanoramaPickProps) {
  const viewerContainerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const markersRef = useRef<MarkersPlugin | null>(null);
  const hasDraftMarkerRef = useRef(false);
  const [panoramaError, setPanoramaError] = useState<string | null>(null);
  const [isPanoramaLoading, setIsPanoramaLoading] = useState(false);

  const isSavingRef = useRef(isSaving);
  const onChooseCoordinateRef = useRef(onChooseCoordinate);

  useEffect(() => {
    isSavingRef.current = isSaving;
  }, [isSaving]);

  useEffect(() => {
    onChooseCoordinateRef.current = onChooseCoordinate;
  }, [onChooseCoordinate]);

  const resetView = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    viewer.rotate({ yaw: 0, pitch: 0 });
    viewer.zoom(0);
  }, []);

  // Initialize the panorama viewer.
  useEffect(() => {
    const container = viewerContainerRef.current;

    if (!container || !previewUrl) return;

    const requestController = new AbortController();
    let viewer: Viewer | null = null;
    let panoramaObjectUrl: string | null = null;
    let handleClick: ((event: unknown) => void) | null = null;
    let cancelled = false;

    setPanoramaError(null);
    setIsPanoramaLoading(true);

    // React development StrictMode immediately runs an effect setup/cleanup cycle.
    // Deferring the request prevents the discarded mount from starting a panorama load.
    const initializationFrame = window.requestAnimationFrame(() => {
      void apiClient
        .get<Blob>(previewUrl, {
          headers: { Accept: 'image/avif,image/webp,image/png,image/jpeg' },
          responseType: 'blob',
          signal: requestController.signal,
        })
        .then((response) => {
          if (cancelled || viewerContainerRef.current !== container) return;

          const panoramaBlob = response.data;
          if (!panoramaBlob.type.startsWith('image/')) {
            throw new Error('The panorama endpoint did not return an image.');
          }

          panoramaObjectUrl = URL.createObjectURL(panoramaBlob);

          viewer = new Viewer({
            container,
            panorama: panoramaObjectUrl,
            navbar: ['zoom', 'fullscreen'],
            defaultZoomLvl: 0,
            mousewheel: true,
            plugins: [[MarkersPlugin, {}]],
          });
          viewerRef.current = viewer;

          const markers = viewer.getPlugin<MarkersPlugin>(MarkersPlugin);
          markersRef.current = markers;

          handleClick = (event: unknown) => {
            const { data } = event as { data: ClickData };
            if (data.rightclick || isSavingRef.current) return;

            const yaw = radiansToDegrees(data.yaw);
            const pitch = radiansToDegrees(data.pitch);

            try {
              hasDraftMarkerRef.current = renderDraftMarker(
                markers,
                { label: '', yaw, pitch },
                hasDraftMarkerRef.current,
              );
            } catch (error) {
              hasDraftMarkerRef.current = false;
              console.error('Failed to place draft hotspot marker:', error);
            }

            onChooseCoordinateRef.current(yaw, pitch);
          };

          viewer.addEventListener('click', handleClick);
          viewer.addEventListener('panorama-loaded', () => {
            if (!cancelled) setIsPanoramaLoading(false);
          });
          viewer.addEventListener('panorama-error', () => {
            if (cancelled) return;
            setIsPanoramaLoading(false);
            setPanoramaError('Panorama gagal ditampilkan. Coba muat ulang atau pilih gambar lain.');
          });
        })
        .catch((error: unknown) => {
          if (cancelled || requestController.signal.aborted) return;
          setIsPanoramaLoading(false);
          setPanoramaError(
            error instanceof Error
              ? error.message
              : 'Panorama gagal dimuat. Coba muat ulang atau pilih gambar lain.',
          );
          console.error('Failed to load panorama:', error);
        });
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(initializationFrame);
      requestController.abort();

      if (viewer && handleClick) {
        viewer.removeEventListener('click', handleClick);
      }

      if (viewerRef.current === viewer) {
        viewerRef.current = null;
        markersRef.current = null;
        hasDraftMarkerRef.current = false;
      }

      viewer?.destroy();
      if (panoramaObjectUrl) URL.revokeObjectURL(panoramaObjectUrl);
    };
  }, [previewUrl]);

  // Update the draft hotspot without recreating the viewer.
  useEffect(() => {
    const markers = markersRef.current;
    if (!markers) return;

    try {
      hasDraftMarkerRef.current = renderDraftMarker(
        markers,
        hotspotForm,
        hasDraftMarkerRef.current,
      );
    } catch (error) {
      hasDraftMarkerRef.current = false;
      console.error('Failed to update draft hotspot:', error);
    }
  }, [hotspotForm]);

  const hasPanorama = Boolean(previewUrl);

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Panorama & Hotspot</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            Pilih panorama, lalu klik titik pada gambar 360° untuk menentukan posisi hotspot menuju
            scene lain.
          </p>
        </div>

        <Button type="button" variant="outline" onClick={onToggleImagePicker} disabled={isSaving}>
          <ImagePlus size={16} />
          {hasPanorama ? 'Ganti Panorama' : 'Pilih Panorama'}
        </Button>
      </div>

      {hasPanorama ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {selectedImage?.title || selectedImage?.caption || 'Panorama terpilih'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {hotspotForm
                  ? 'Mode penempatan hotspot aktif'
                  : 'Klik panorama untuk menentukan koordinat hotspot'}
              </p>
            </div>

            <Button type="button" variant="outline" onClick={resetView} disabled={isSaving}>
              <RotateCcw size={15} />
              Reset View
            </Button>
          </div>

          <div className="relative bg-gray-950">
            <div
              ref={viewerContainerRef}
              className="h-[min(62vh,620px)] min-h-[320px] w-full"
              aria-label="Panorama 360 derajat untuk memilih posisi hotspot"
            />

            <div className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-black/60 px-3 py-2 text-xs text-white">
              Drag untuk melihat sekitar · Scroll untuk zoom
            </div>
          </div>

          {isPanoramaLoading && !panoramaError ? (
            <div className="border-t border-gray-200 px-4 py-3">
              <StatusMessage tone="info">Memuat panorama...</StatusMessage>
            </div>
          ) : null}

          {panoramaError ? (
            <div className="border-t border-gray-200 px-4 py-3">
              <StatusMessage tone="error">{panoramaError}</StatusMessage>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-px border-t border-gray-200 bg-gray-200">
            <div className="bg-white px-4 py-3">
              <p className="text-xs text-gray-500">Yaw</p>
              <p className="mt-1 font-mono text-sm font-medium text-gray-900">
                {hotspotForm ? `${hotspotForm.yaw.toFixed(2)}°` : '—'}
              </p>
            </div>
            <div className="bg-white px-4 py-3">
              <p className="text-xs text-gray-500">Pitch</p>
              <p className="mt-1 font-mono text-sm font-medium text-gray-900">
                {hotspotForm ? `${hotspotForm.pitch.toFixed(2)}°` : '—'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm ring-1 ring-gray-200">
            <ImagePlus size={21} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-gray-900">Belum ada panorama</h3>

          <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500">
            Pilih gambar panorama 360° dari galeri untuk mulai mengatur posisi hotspot scene ini.
          </p>

          <div className="mt-4">
            <Button type="button" onClick={onToggleImagePicker} disabled={isSaving}>
              <ImagePlus size={16} />
              Pilih Panorama
            </Button>
          </div>
        </div>
      )}

      {hotspotForm && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-start justify-between gap-3 border-b border-gray-200 px-4 py-4 sm:px-5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#7e1518]">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Konfigurasi Hotspot</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Atur label, tujuan, dan koordinat hotspot.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCancelHotspot}
              disabled={isSaving}
              className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Batalkan konfigurasi hotspot"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={onSaveHotspot} className="space-y-5 p-4 sm:p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Label Hotspot" required>
                <input
                  className={FIELD_CLASS}
                  value={hotspotForm.label}
                  onChange={(event) => onHotspotChange({ label: event.target.value })}
                  placeholder="Contoh: Menuju Lobby"
                  maxLength={100}
                  required
                  disabled={isSaving}
                />
              </Field>

              <Field label="Tujuan Scene" required>
                <Select
                  value={hotspotForm.toSceneId}
                  onChange={(event) => onHotspotChange({ toSceneId: event.target.value })}
                  disabled={isSaving}
                  required
                >
                  <option value="">Pilih scene tujuan</option>
                  {targetScenes.map((target) => (
                    <option key={target.id} value={target.id}>
                      {target.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div>
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-900">Koordinat Panorama</h4>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Klik panorama untuk mengatur koordinat secara langsung, atau masukkan nilai di
                  bawah.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Yaw (derajat)" required>
                  <input
                    className={FIELD_CLASS}
                    type="number"
                    step="0.01"
                    value={hotspotForm.yaw}
                    onChange={(event) =>
                      onHotspotChange({
                        yaw: Number(event.target.value),
                      })
                    }
                    required
                    disabled={isSaving}
                  />
                </Field>

                <Field label="Pitch (derajat)" required>
                  <input
                    className={FIELD_CLASS}
                    type="number"
                    step="0.01"
                    min="-90"
                    max="90"
                    value={hotspotForm.pitch}
                    onChange={(event) =>
                      onHotspotChange({
                        pitch: Number(event.target.value),
                      })
                    }
                    required
                    disabled={isSaving}
                  />
                </Field>
              </div>
            </div>

            {targetScenes.filter((target) => target.id !== scene?.id).length === 0 && (
              <StatusMessage tone="warning">
                Belum ada scene lain yang bisa dijadikan tujuan hotspot. Buat scene lain terlebih
                dahulu.
              </StatusMessage>
            )}

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onCancelHotspot} disabled={isSaving}>
                Batal
              </Button>

              <Button
                type="submit"
                disabled={
                  isSaving ||
                  !hotspotForm.label.trim() ||
                  !hotspotForm.toSceneId ||
                  targetScenes.filter((target) => target.id !== scene?.id).length === 0
                }
              >
                <Check size={16} />
                {isSaving ? 'Menyimpan...' : 'Simpan Hotspot'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <CoverImagePickerModal
        open={isImagePickerOpen}
        onClose={onCloseImagePicker}
        galleries={galleries}
        allowedKinds={['IMAGE']}
        title="Choose panorama"
        onSelect={onSelectPanorama}
        onSelectLocalFile={onUploadLocalImage}
      />
    </section>
  );
}
