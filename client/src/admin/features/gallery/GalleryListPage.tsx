import { useEffect, useState, type FormEvent } from "react";
import { adminApi, type GalleryItem } from "@/admin/api/adminApi";
import AppShell from "@/admin/components/layout/AppShell";
import Button from "@/admin/components/ui/Button";
import Field from "@/admin/components/ui/Field";
import Modal from "@/admin/components/ui/Modal";
import SearchInput from "@/admin/components/ui/SearchInput";
import Select from "@/admin/components/ui/Select";
import GalleryList from "./components/layouts/GalleryList";
import { Plus } from "lucide-react";

type GallerySort = "az" | "newest" | "oldest" | "za";

export default function GalleryListPage() {
  const [galleries, setGalleries] = useState<GalleryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<GallerySort>("newest");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [galleryDescription, setGalleryDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const filteredGalleries = galleries
    .filter((gallery) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return [gallery.title, gallery.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
    })
    .sort((first, second) => {
      if (sortBy === "az") return first.title.localeCompare(second.title);
      if (sortBy === "za") return second.title.localeCompare(first.title);
      if (sortBy === "oldest") {
        return (
          new Date(first.createdAt).getTime() -
          new Date(second.createdAt).getTime()
        );
      }
      return (
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime()
      );
    });

  async function loadGalleries() {
    setGalleries(await adminApi.galleries());
  }

  function optionalText(value: string) {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  useEffect(() => {
    loadGalleries()
      .catch((error) =>
        setMessage(
          error instanceof Error ? error.message : "Failed to load galleries.",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  async function deleteGallery(id: string) {
    setIsSaving(true);
    setMessage(null);

    try {
      await adminApi.deleteGallery(id);
      await loadGalleries();
      setMessage("Gallery deleted.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to delete gallery.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function createGallery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      await adminApi.createGallery({
        title: galleryTitle,
        description: optionalText(galleryDescription),
      });
      setGalleryTitle("");
      setGalleryDescription("");
      setIsCreateOpen(false);
      await loadGalleries();
      setMessage("Gallery created.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to create gallery.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell title="Gallery List">
      <section className="space-y-5 p-6">
        {/* Breadcrumb */}
        <p className="text-sm text-gray-500">All Galleries</p>

        {/* Main Panel */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                All Galleries
              </h1>
              <p className="text-sm text-gray-500">
                Manage your website galleries and media assets.
              </p>
            </div>

            <Button
              type="button"
              size="sm"
              className="inline-flex items-center gap-1.5 px-3 text-xs"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus size={14} />
              <span>Add Gallery</span>
            </Button>
          </div>

          {/* Search / Filter */}
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 px-5 py-4">
            <SearchInput
              type="text"
              placeholder="Search your gallery"
              className="max-w-sm"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />

            <Select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as GallerySort)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="az">A-Z</option>
              <option value="za">Z-A</option>
            </Select>
          </div>

          {/* List */}
          <div className="p-4">
            <GalleryList
              galleries={filteredGalleries}
              isLoading={isLoading}
              isSaving={isSaving}
              message={message}
              onDelete={deleteGallery}
            />
          </div>
        </div>
      </section>

      <Modal
        open={isCreateOpen}
        title="Create Gallery"
        onClose={() => setIsCreateOpen(false)}
      >
        <form className="grid gap-4" onSubmit={createGallery}>
          <Field label="Title">
            <input
              className="rounded border border-[rgba(36,23,24,0.18)] px-3 py-2"
              required
              value={galleryTitle}
              onChange={(event) => setGalleryTitle(event.target.value)}
            />
          </Field>
          <Field label="Description">
            <textarea
              className="min-h-24 rounded border border-[rgba(36,23,24,0.18)] px-3 py-2"
              value={galleryDescription}
              onChange={(event) => setGalleryDescription(event.target.value)}
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={isSaving} type="submit">
              Create Gallery
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
