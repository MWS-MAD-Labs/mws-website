import { Image, Maximize2, Trash2 } from "lucide-react";
import { TextField } from "./ContactEditorControls";
import type { ContactEditorSectionProps } from "./types";

export default function Hero({
  content,
  updateContent,
}: ContactEditorSectionProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-[rgba(36,23,24,0.14)] bg-white shadow-sm">
      {/* Section Header */}
      <div className="flex items-start justify-between border-b border-[rgba(36,23,24,0.10)] px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#f3f0ef] text-xs font-bold text-[#625759]">
            01
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#241718]">Hero</h2>
            <p className="mt-0.5 text-xs text-[#817678]">
              Configure the main hero content displayed at the top of the
              Contact page.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="mt-1 text-[#625759] transition-colors hover:text-[#7e1518]"
          aria-label="Collapse Hero section"
        >
          <span className="text-sm">⌃</span>
        </button>
      </div>

      {/* Section Content */}
      <div className="grid items-start gap-5 p-5 lg:grid-cols-2">
        {/* Left: Text Fields */}
        <div className="space-y-8">
          <TextField
            label="Title"
            value={content.hero.title}
            onChange={(value) =>
              updateContent((current) => ({
                ...current,
                hero: {
                  ...current.hero,
                  title: value,
                },
              }))
            }
          />

          <TextField
            label="Image Alt Text"
            value={content.hero.imageAlt}
            onChange={(value) =>
              updateContent((current) => ({
                ...current,
                hero: {
                  ...current.hero,
                  imageAlt: value,
                },
              }))
            }
          />
        </div>

        {/* Right: Image */}
        <div className="min-w-0">
          <label className="block text-sm font-semibold text-[#241718]">
            Hero Image
          </label>

          <div className="group relative mt-2 overflow-hidden rounded-md border border-[rgba(36,23,24,0.14)] bg-[#f5f3f2]">
            {content.hero.image ? (
              <>
                <img
                  src={content.hero.image}
                  alt={content.hero.imageAlt || "Hero image"}
                  className="aspect-[16/4] w-full object-cover"
                />

                <button
                  type="button"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                  aria-label="Preview image"
                >
                  <Maximize2 size={14} />
                </button>
              </>
            ) : (
              <div className="flex aspect-[16/7] items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-[#817678]">
                  <Image size={24} strokeWidth={1.5} />
                  <span className="text-xs">No image selected</span>
                </div>
              </div>
            )}
          </div>

          {/* Image Actions */}
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#7e1518] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#691215]"
            >
              <Image size={14} />
              Change Image
            </button>

            {content.hero.image && (
              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-[rgba(36,23,24,0.16)] bg-white px-3 text-xs font-semibold text-[#625759] transition-colors hover:border-[#7e1518]/30 hover:text-[#7e1518]"
                onClick={() =>
                  updateContent((current) => ({
                    ...current,
                    hero: {
                      ...current.hero,
                      image: "",
                    },
                  }))
                }
              >
                <Trash2 size={14} />
                Remove
              </button>
            )}
          </div>

          <p className="mt-2 text-[11px] text-[#817678]">
            Recommended size: 1920 × 600 (16:5)
          </p>
        </div>
      </div>
    </section>
  );
}
