import { useEffect, useMemo, useState, type FormEvent } from 'react';

import {
  adminApi,
  type AdminCommunityVoice,
  type AdminCommunityVoicePayload,
  type GalleryItem,
} from '@/admin/api/adminApi';
import AppShell from '@/admin/components/layout/AppShell';
import Button from '@/admin/components/ui/Button';
import ContentPageHeader from '@/admin/components/ui/ContentPageHeader';
import Field from '@/admin/components/ui/Field';
import Select from '@/admin/components/ui/Select';
import StatusMessage from '@/admin/components/ui/StatusMessage';
import { useToastState } from '@/admin/components/ui/toastContext';
import { uploadImageForPicker } from '@/admin/features/gallery/utils/uploadImageForPicker';
import CoverImagePickerModal from '@/admin/features/news/components/layouts/CoverImagePickerModal';

type VoiceForm = {
  grade: string;
  imagePath: string;
  isActive: boolean;
  name: string;
  quote: string;
  role: string;
  sortOrder: string;
};

const VOICE_ROLE_OPTIONS = ['Parent', 'Student', 'Teacher', 'Staff', 'Alumni', 'Community'];

const emptyVoiceForm: VoiceForm = {
  grade: '',
  imagePath: '',
  isActive: true,
  name: '',
  quote: '',
  role: VOICE_ROLE_OPTIONS[0],
  sortOrder: '0',
};

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function voiceToForm(voice: AdminCommunityVoice): VoiceForm {
  return {
    grade: voice.grade ?? '',
    imagePath: voice.imagePath,
    isActive: voice.isActive,
    name: voice.name,
    quote: voice.quote,
    role: voice.role,
    sortOrder: String(voice.sortOrder),
  };
}

function voicePayload(form: VoiceForm): AdminCommunityVoicePayload {
  return {
    grade: optionalText(form.grade),
    imagePath: form.imagePath,
    isActive: form.isActive,
    name: form.name,
    quote: form.quote,
    role: form.role,
    sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
  };
}

export default function CommunityVoicesPage() {
  const [voices, setVoices] = useState<AdminCommunityVoice[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [voiceForm, setVoiceForm] = useState<VoiceForm>(emptyVoiceForm);
  const [editingVoiceId, setEditingVoiceId] = useState<string | null>(null);
  const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [message, setMessage] = useToastState<string | null>(null);

  const editingVoice = useMemo(
    () => voices.find((voice) => voice.id === editingVoiceId) ?? null,
    [editingVoiceId, voices],
  );
  const hasCustomRole = voiceForm.role !== '' && !VOICE_ROLE_OPTIONS.includes(voiceForm.role);

  async function loadData() {
    const [voiceData, galleryData] = await Promise.all([
      adminApi.communityVoices(),
      adminApi.galleries(),
    ]);

    setVoices(voiceData);
    setGalleries(galleryData);
  }

  useEffect(() => {
    queueMicrotask(() => {
      loadData()
        .catch((error) =>
          setMessage(error instanceof Error ? error.message : 'Failed to load community voices.'),
        )
        .finally(() => setIsLoading(false));
    });
  }, [setMessage]);

  async function saveVoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      if (editingVoiceId) {
        await adminApi.updateCommunityVoice(editingVoiceId, voicePayload(voiceForm));
        setMessage('Community voice updated.');
      } else {
        await adminApi.createCommunityVoice(voicePayload(voiceForm));
        setMessage('Community voice created.');
      }

      setEditingVoiceId(null);
      setVoiceForm(emptyVoiceForm);
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save community voice.');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteVoice(id: string) {
    const confirmed = window.confirm('Delete this community voice? This action cannot be undone.');
    if (!confirmed) return;

    setIsSaving(true);
    setMessage(null);

    try {
      await adminApi.deleteCommunityVoice(id);
      if (editingVoiceId === id) {
        setEditingVoiceId(null);
        setVoiceForm(emptyVoiceForm);
      }
      await loadData();
      setMessage('Community voice deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete community voice.');
    } finally {
      setIsSaving(false);
    }
  }

  async function uploadVoiceImage(file: File) {
    setIsUploadingImage(true);
    setMessage(null);

    try {
      const uploaded = await uploadImageForPicker({
        caption: voiceForm.name || 'Community voice image',
        fallbackGalleryTitle: 'Community Voice Images',
        file,
        galleries,
      });

      setGalleries(uploaded.galleries);
      setVoiceForm((current) => ({
        ...current,
        imagePath: uploaded.path,
      }));
      setMessage('Voice image uploaded. Save voice to publish it.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to upload voice image.');
    } finally {
      setIsUploadingImage(false);
    }
  }

  return (
    <AppShell title="Community Voices">
      <section className="space-y-5 p-6">
        <ContentPageHeader
          breadcrumbs={[{ label: 'Content' }, { label: 'Community Voices' }]}
          title="Community Voices"
          description="Manage parent, student, teacher, staff, alumni, and community voices shown on Home."
        />

        {message ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-3">
            <StatusMessage>{message}</StatusMessage>
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-lg border border-[#E2E8F0] bg-white p-6 text-sm text-[#64748B]">
            Loading community voices...
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
            <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
              <div className="border-b border-[#E2E8F0] px-5 py-4">
                <h2 className="text-lg font-semibold text-[#1C2434]">Voice List</h2>
                <p className="text-sm text-[#64748B]">
                  These entries are stored in the database and rendered by the Home page.
                </p>
              </div>

              {!voices.length ? (
                <div className="p-5 text-sm text-[#64748B]">No community voices yet.</div>
              ) : (
                <div className="divide-y divide-[#E2E8F0]">
                  {voices.map((voice) => (
                    <div
                      className="grid gap-4 px-5 py-4 md:grid-cols-[64px_minmax(0,1fr)_120px_150px] md:items-center"
                      key={voice.id}
                    >
                      <img
                        className="h-14 w-14 rounded-lg object-cover"
                        src={adminApi.publicAssetUrl(voice.imagePath)}
                        alt={voice.name}
                      />

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-[#1C2434]">
                          {voice.name}
                        </h3>
                        <p className="truncate text-sm text-[#64748B]">
                          {voice.role}
                          {voice.grade ? ` - ${voice.grade}` : ''}
                        </p>
                      </div>

                      <p className="text-sm text-[#64748B]">
                        {voice.isActive ? 'Active' : 'Hidden'}
                      </p>

                      <div className="flex justify-end gap-2">
                        <Button
                          disabled={isSaving}
                          size="sm"
                          type="button"
                          variant="danger"
                          onClick={() => void deleteVoice(voice.id)}
                        >
                          Delete
                        </Button>
                        <Button
                          disabled={isSaving}
                          size="sm"
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditingVoiceId(voice.id);
                            setVoiceForm(voiceToForm(voice));
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <form className="h-fit rounded-lg border border-[#E2E8F0] bg-white" onSubmit={saveVoice}>
              <div className="border-b border-[#E2E8F0] px-5 py-4">
                <h2 className="text-base font-semibold text-[#1C2434]">
                  {editingVoice ? 'Edit Voice' : 'New Voice'}
                </h2>
              </div>

              <div className="grid gap-4 p-5">
                <Field label="Name">
                  <input
                    className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                    required
                    value={voiceForm.name}
                    onChange={(event) =>
                      setVoiceForm((current) => ({ ...current, name: event.target.value }))
                    }
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Role">
                    <Select
                      className="w-full"
                      required
                      value={hasCustomRole ? voiceForm.role : voiceForm.role}
                      onChange={(event) =>
                        setVoiceForm((current) => ({ ...current, role: event.target.value }))
                      }
                    >
                      {hasCustomRole ? <option value={voiceForm.role}>{voiceForm.role}</option> : null}
                      {VOICE_ROLE_OPTIONS.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <Field label="Grade / context">
                    <input
                      className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                      value={voiceForm.grade}
                      onChange={(event) =>
                        setVoiceForm((current) => ({ ...current, grade: event.target.value }))
                      }
                    />
                  </Field>
                </div>

                <Field label="Quote">
                  <textarea
                    className="min-h-28 rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                    required
                    value={voiceForm.quote}
                    onChange={(event) =>
                      setVoiceForm((current) => ({ ...current, quote: event.target.value }))
                    }
                  />
                </Field>

                <div className="rounded-lg border border-[#E2E8F0] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[#1C2434]">Voice Image</h3>
                      <p className="truncate text-sm text-[#64748B]">
                        {voiceForm.imagePath || 'No image selected.'}
                      </p>
                    </div>

                    <Button
                      disabled={isSaving || isUploadingImage}
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => setIsAssetPickerOpen(true)}
                    >
                      Choose Image
                    </Button>
                  </div>

                  {voiceForm.imagePath ? (
                    <img
                      className="mt-3 aspect-video w-full rounded-lg object-cover"
                      src={adminApi.publicAssetUrl(voiceForm.imagePath)}
                      alt={voiceForm.name || 'Community voice image'}
                    />
                  ) : null}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Sort order">
                    <input
                      className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm"
                      type="number"
                      value={voiceForm.sortOrder}
                      onChange={(event) =>
                        setVoiceForm((current) => ({ ...current, sortOrder: event.target.value }))
                      }
                    />
                  </Field>

                  <label className="mt-6 flex items-center gap-2 text-sm text-[#1C2434]">
                    <input
                      checked={voiceForm.isActive}
                      type="checkbox"
                      onChange={(event) =>
                        setVoiceForm((current) => ({
                          ...current,
                          isActive: event.target.checked,
                        }))
                      }
                    />
                    Active on Home
                  </label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingVoiceId(null);
                      setVoiceForm(emptyVoiceForm);
                    }}
                  >
                    Clear
                  </Button>
                  <Button disabled={isSaving || isUploadingImage} type="submit">
                    {isUploadingImage ? 'Uploading...' : isSaving ? 'Saving...' : 'Save Voice'}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        <CoverImagePickerModal
          galleries={galleries}
          open={isAssetPickerOpen}
          title="Choose Voice Image"
          onClose={() => setIsAssetPickerOpen(false)}
          onSelect={(asset) =>
            setVoiceForm((current) => ({
              ...current,
              imagePath: asset.path,
            }))
          }
          onSelectLocalFile={(file) => void uploadVoiceImage(file)}
        />
      </section>
    </AppShell>
  );
}
