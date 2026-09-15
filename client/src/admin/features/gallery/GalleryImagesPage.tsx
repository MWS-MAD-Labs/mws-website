import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import {
  adminApi,
  type GalleryImageItem,
  type GalleryItem,
} from "@/admin/api/adminApi";
import AppShell from "@/admin/components/layout/AppShell";

type ImageEditState = {
  title: string;
  caption: string;
  sortOrder: string;
};

const emptyImageEdit: ImageEditState = {
  title: "",
  caption: "",
  sortOrder: "0",
};

function imageToEditState(image: GalleryImageItem): ImageEditState {
  return {
    title: image.title ?? "",
    caption: image.caption ?? "",
    sortOrder: String(image.sortOrder),
  };
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export default function GalleryImagesPage() {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [selectedGalleryId, setSelectedGalleryId] = useState("");
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryDescription, setGalleryDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageSortOrder, setImageSortOrder] = useState("0");
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [imageEdit, setImageEdit] = useState<ImageEditState>(emptyImageEdit);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedGallery = useMemo(
    () => galleries.find((gallery) => gallery.id === selectedGalleryId) ?? null,
    [galleries, selectedGalleryId],
  );

  async function loadGalleries(preferredGalleryId?: string) {
    const data = await adminApi.galleries();
    setGalleries(data);
    setSelectedGalleryId((current) => {
      if (preferredGalleryId && data.some((gallery) => gallery.id === preferredGalleryId)) {
        return preferredGalleryId;
      }
      if (current && data.some((gallery) => gallery.id === current)) return current;
      return data[0]?.id ?? "";
    });
  }

  useEffect(() => {
    loadGalleries()
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : "Failed to load galleries."),
      )
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  function chooseFile(nextFile: File | null) {
    if (!nextFile) return;
    setFile(nextFile);
    if (!imageTitle) {
      setImageTitle(nextFile.name.replace(/\.[^.]+$/, ""));
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    chooseFile(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    chooseFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function handleCreateGallery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSaving(true);

    try {
      const gallery = await adminApi.createGallery({
        title: galleryTitle,
        description: optionalText(galleryDescription),
      });
      setGalleryTitle("");
      setGalleryDescription("");
      await loadGalleries(gallery.id);
      setMessage("Gallery created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create gallery.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedGalleryId || !file) return;

    setMessage(null);
    setIsSaving(true);

    try {
      await adminApi.uploadGalleryImage(selectedGalleryId, {
        file,
        title: imageTitle.trim(),
        caption: imageCaption.trim(),
        sortOrder: imageSortOrder,
      });
      setFile(null);
      setImageTitle("");
      setImageCaption("");
      setImageSortOrder("0");
      await loadGalleries(selectedGalleryId);
      setMessage("Image uploaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUpdateImage(imageId: string) {
    setMessage(null);
    setIsSaving(true);

    try {
      await adminApi.updateGalleryImage(imageId, {
        title: optionalText(imageEdit.title),
        caption: optionalText(imageEdit.caption),
        sortOrder: Number(imageEdit.sortOrder || 0),
      });
      setEditingImageId(null);
      setImageEdit(emptyImageEdit);
      await loadGalleries(selectedGalleryId);
      setMessage("Image metadata updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update image.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteImage(imageId: string) {
    setMessage(null);
    setIsSaving(true);

    try {
      await adminApi.deleteGalleryImage(imageId);
      await loadGalleries(selectedGalleryId);
      setMessage("Image deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete image.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell eyebrow="MWS CMS" title="Gallery Images">
      <section className="grid gap-6 p-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="grid content-start gap-6">
          <form
            className="rounded-lg border border-[rgba(36,23,24,0.14)] bg-white p-5 shadow-sm"
            onSubmit={handleCreateGallery}
          >
            <h2 className="mb-4 text-lg font-semibold">New Gallery</h2>
            <div className="grid gap-4">
              <label className="grid gap-1 text-sm font-medium">
                Title
                <input
                  className="rounded border border-[rgba(36,23,24,0.18)] px-3 py-2"
                  required
                  value={galleryTitle}
                  onChange={(event) => setGalleryTitle(event.target.value)}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Description
                <textarea
                  className="min-h-20 rounded border border-[rgba(36,23,24,0.18)] px-3 py-2"
                  value={galleryDescription}
                  onChange={(event) => setGalleryDescription(event.target.value)}
                />
              </label>
              <button
                className="rounded bg-[#241718] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                disabled={isSaving}
                type="submit"
              >
                Create Gallery
              </button>
            </div>
          </form>

          <form
            className="rounded-lg border border-[rgba(36,23,24,0.14)] bg-white p-5 shadow-sm"
            onSubmit={handleUpload}
          >
            <h2 className="mb-4 text-lg font-semibold">Upload Image</h2>
            <div className="grid gap-4">
              <label className="grid gap-1 text-sm font-medium">
                Gallery
                <select
                  className="rounded border border-[rgba(36,23,24,0.18)] px-3 py-2"
                  required
                  value={selectedGalleryId}
                  onChange={(event) => setSelectedGalleryId(event.target.value)}
                >
                  <option value="" disabled>
                    Select gallery
                  </option>
                  {galleries.map((gallery) => (
                    <option key={gallery.id} value={gallery.id}>
                      {gallery.title}
                    </option>
                  ))}
                </select>
              </label>

              <label
                className="grid min-h-36 cursor-pointer place-items-center rounded-lg border border-dashed border-[rgba(36,23,24,0.28)] bg-[#faf8f3] p-4 text-center"
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
              >
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {previewUrl ? (
                  <img
                    className="max-h-44 rounded object-contain"
                    src={previewUrl}
                    alt={file?.name ?? "Selected image preview"}
                  />
                ) : (
                  <span className="text-sm font-medium text-[#625759]">
                    Choose image
                  </span>
                )}
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Title
                <input
                  className="rounded border border-[rgba(36,23,24,0.18)] px-3 py-2"
                  value={imageTitle}
                  onChange={(event) => setImageTitle(event.target.value)}
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Caption
                <textarea
                  className="min-h-20 rounded border border-[rgba(36,23,24,0.18)] px-3 py-2"
                  value={imageCaption}
                  onChange={(event) => setImageCaption(event.target.value)}
                />
              </label>

              <label className="grid gap-1 text-sm font-medium">
                Sort Order
                <input
                  className="rounded border border-[rgba(36,23,24,0.18)] px-3 py-2"
                  type="number"
                  value={imageSortOrder}
                  onChange={(event) => setImageSortOrder(event.target.value)}
                />
              </label>

              <button
                className="rounded bg-[#241718] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                disabled={isSaving || !file || !selectedGalleryId}
                type="submit"
              >
                Upload Image
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-lg border border-[rgba(36,23,24,0.14)] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(36,23,24,0.1)] px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold">
                {selectedGallery?.title ?? "Galleries"}
              </h2>
              {selectedGallery?.description ? (
                <p className="mt-1 text-sm text-[#625759]">
                  {selectedGallery.description}
                </p>
              ) : null}
            </div>
            {message ? <p className="text-sm text-[#7b3f2a]">{message}</p> : null}
          </div>

          {isLoading ? (
            <div className="p-5 text-sm text-[#625759]">Loading...</div>
          ) : null}

          {!isLoading && !galleries.length ? (
            <div className="p-5 text-sm text-[#625759]">No galleries yet.</div>
          ) : null}

          {!isLoading && selectedGallery ? (
            <div className="grid gap-4 p-5 sm:grid-cols-2 2xl:grid-cols-3">
              {selectedGallery.images.map((image) => (
                <article
                  className="overflow-hidden rounded-lg border border-[rgba(36,23,24,0.12)]"
                  key={image.id}
                >
                  <div className="grid aspect-[4/3] place-items-center bg-[#f4efe6]">
                    <img
                      className="h-full w-full object-cover"
                      src={adminApi.galleryImageUrl(image)}
                      alt={image.title ?? "Gallery image"}
                    />
                  </div>

                  <div className="grid gap-3 p-4">
                    {editingImageId === image.id ? (
                      <>
                        <input
                          className="rounded border border-[rgba(36,23,24,0.18)] px-3 py-2 text-sm"
                          value={imageEdit.title}
                          onChange={(event) =>
                            setImageEdit((current) => ({
                              ...current,
                              title: event.target.value,
                            }))
                          }
                        />
                        <textarea
                          className="min-h-20 rounded border border-[rgba(36,23,24,0.18)] px-3 py-2 text-sm"
                          value={imageEdit.caption}
                          onChange={(event) =>
                            setImageEdit((current) => ({
                              ...current,
                              caption: event.target.value,
                            }))
                          }
                        />
                        <input
                          className="rounded border border-[rgba(36,23,24,0.18)] px-3 py-2 text-sm"
                          type="number"
                          value={imageEdit.sortOrder}
                          onChange={(event) =>
                            setImageEdit((current) => ({
                              ...current,
                              sortOrder: event.target.value,
                            }))
                          }
                        />
                        <div className="flex gap-2">
                          <button
                            className="rounded bg-[#241718] px-3 py-1.5 text-sm font-semibold text-white"
                            disabled={isSaving}
                            type="button"
                            onClick={() => handleUpdateImage(image.id)}
                          >
                            Save
                          </button>
                          <button
                            className="rounded border border-[rgba(36,23,24,0.18)] px-3 py-1.5 text-sm font-semibold"
                            type="button"
                            onClick={() => {
                              setEditingImageId(null);
                              setImageEdit(emptyImageEdit);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <h3 className="font-semibold">
                            {image.title || "Untitled image"}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-sm text-[#625759]">
                            {image.caption || "-"}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="rounded border border-[rgba(36,23,24,0.18)] px-3 py-1.5 text-sm font-semibold"
                            type="button"
                            onClick={() => {
                              setEditingImageId(image.id);
                              setImageEdit(imageToEditState(image));
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="rounded border border-[#b3261e] px-3 py-1.5 text-sm font-semibold text-[#b3261e]"
                            disabled={isSaving}
                            type="button"
                            onClick={() => handleDeleteImage(image.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </article>
              ))}

              {!selectedGallery.images.length ? (
                <div className="col-span-full rounded-lg border border-dashed border-[rgba(36,23,24,0.18)] p-6 text-sm text-[#625759]">
                  No images in this gallery yet.
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
