import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  adminApi,
  type GalleryItem,
  type OurSchoolItem,
} from "@/admin/api/adminApi";
import AppShell from "@/admin/components/layout/AppShell";
import Button from "@/admin/components/ui/Button";
import Field from "@/admin/components/ui/Field";
import StatusMessage from "@/admin/components/ui/StatusMessage";
import GalleryPickerModal from "@/admin/features/gallery/components/GalleryPickerModal";
import GalleryThumb from "@/admin/features/gallery/components/GalleryThumb";

type FormState = {
  description: string;
  galleryId: string | null;
  title: string;
};

const emptyForm: FormState = {
  description: "",
  galleryId: null,
  title: "",
};

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function OurSchoolPage() {
  const [items, setItems] = useState<OurSchoolItem[]>([]);
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const editingItem = useMemo(
    () => items.find((item) => item.id === editingId) ?? null,
    [editingId, items],
  );
  const selectedGallery =
    galleries.find((gallery) => gallery.id === form.galleryId) ??
    editingItem?.gallery ??
    null;

  async function loadData() {
    const [nextItems, nextGalleries] = await Promise.all([
      adminApi.ourSchools(),
      adminApi.galleries(),
    ]);
    setItems(nextItems);
    setGalleries(nextGalleries);
  }

  useEffect(() => {
    queueMicrotask(() => {
      loadData()
        .catch((error) =>
          setMessage(error instanceof Error ? error.message : "Failed to load Our School."),
        )
        .finally(() => setIsLoading(false));
    });
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function editItem(item: OurSchoolItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description ?? "",
      galleryId: item.galleryId,
    });
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const payload = {
      title: form.title,
      description: optionalText(form.description),
      galleryId: form.galleryId,
    };

    try {
      if (editingId) {
        await adminApi.updateOurSchool(editingId, payload);
        setMessage("Our School content updated.");
      } else {
        await adminApi.createOurSchool(payload);
        setMessage("Our School content created.");
      }

      resetForm();
      await loadData();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to save Our School.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteItem(id: string) {
    setIsSaving(true);
    setMessage(null);

    try {
      await adminApi.deleteOurSchool(id);
      if (editingId === id) resetForm();
      await loadData();
      setMessage("Our School content deleted.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to delete Our School.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell title="Our School">
      <section className="space-y-5 p-6">
        <p className="text-sm text-gray-500">Our School</p>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-200 px-5 py-4">
              <h1 className="text-lg font-semibold text-gray-900">
                Our School Content
              </h1>
              <p className="text-sm text-gray-500">
                Manage simple Our School entries and connect them to Gallery.
              </p>
            </div>

            {message ? (
              <div className="border-b border-gray-200 bg-[#faf8f3] px-5 py-3">
                <StatusMessage>{message}</StatusMessage>
              </div>
            ) : null}

            <div className="p-4">
              {isLoading ? (
                <div className="rounded-lg border border-gray-200 p-6 text-sm text-gray-500">
                  Loading Our School...
                </div>
              ) : null}

              {!isLoading && !items.length ? (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-sm text-gray-500">
                  No Our School content yet.
                </div>
              ) : null}

              {items.length ? (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <div className="hidden grid-cols-[minmax(0,1fr)_180px_150px] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-500 md:grid">
                    <span>Content</span>
                    <span>Gallery</span>
                    <span className="text-right">Actions</span>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {items.map((item) => (
                      <div
                        className="grid gap-4 px-4 py-3 md:grid-cols-[minmax(0,1fr)_180px_150px] md:items-center"
                        key={item.id}
                      >
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-semibold text-gray-900">
                            {item.title}
                          </h2>
                          <p className="truncate text-sm text-gray-500">
                            {item.description || "-"}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.gallery?.title ?? "No gallery"}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            disabled={isSaving}
                            size="sm"
                            type="button"
                            variant="danger"
                            onClick={() => deleteItem(item.id)}
                          >
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            type="button"
                            variant="outline"
                            onClick={() => editItem(item)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <form
            className="h-fit rounded-lg border border-gray-200 bg-white"
            onSubmit={saveItem}
          >
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-base font-semibold text-gray-900">
                {editingId ? "Edit Content" : "Create Content"}
              </h2>
              <p className="text-sm text-gray-500">
                Select a Gallery through the picker, not by typing an ID.
              </p>
            </div>

            <div className="grid gap-4 p-5">
              <Field label="Title">
                <input
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#7e1518]"
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                />
              </Field>

              <Field label="Description">
                <textarea
                  className="min-h-24 rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#7e1518]"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                />
              </Field>

              <div className="grid gap-2">
                <span className="text-sm font-medium">Gallery</span>
                {selectedGallery ? (
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                    <GalleryThumb gallery={selectedGallery} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {selectedGallery.title}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {selectedGallery.description || "-"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {selectedGallery.images.length} Images /{" "}
                        {selectedGallery.videos.length} Videos
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
                    No gallery selected.
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => setIsPickerOpen(true)}
                  >
                    Choose Gallery
                  </Button>
                  {form.galleryId ? (
                    <Button
                      size="sm"
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        setForm((current) => ({ ...current, galleryId: null }))
                      }
                    >
                      Clear
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                {editingId ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                ) : null}
                <Button disabled={isSaving} type="submit">
                  {editingId ? "Update Content" : "Create Content"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <GalleryPickerModal
        galleries={galleries}
        isLoading={isLoading}
        open={isPickerOpen}
        selectedGalleryId={form.galleryId}
        onClose={() => setIsPickerOpen(false)}
        onSelect={(galleryId) =>
          setForm((current) => ({ ...current, galleryId }))
        }
      />
    </AppShell>
  );
}
