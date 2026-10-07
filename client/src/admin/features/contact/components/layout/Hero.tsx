import { Image, Trash2 } from "lucide-react";

import Button from "@/admin/components/ui/Button";
import { publicAssetUrl } from "@/lib/api";

import { TextAreaField, TextField } from "./ContactEditorControls";
import type { ContactEditorSectionProps } from "./types";

export default function Hero({
  content,
  isBusy = false,
  onChooseHeroImage,
  updateContent,
}: ContactEditorSectionProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm">
      <div className="flex items-start justify-between border-b border-[#E2E8F0] px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#f3f0ef] text-xs font-bold text-[#64748B]">
            01
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#1C2434]">Introduction</h2>
            <p className="mt-0.5 text-xs text-[#817678]">
              Manage the title, introduction, and image shown at the top of the Contact page.
            </p>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-5 p-5 lg:grid-cols-2">
        <div className="space-y-5">
          <TextField
            label="Title"
            disabled={isBusy}
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

          <TextAreaField
            label="Introduction"
            disabled={isBusy}
            value={content.intro}
            onChange={(value) =>
              updateContent((current) => ({ ...current, intro: value }))
            }
          />

          <div>
            <label className="block text-sm font-semibold text-[#1C2434]">Image</label>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button
                disabled={isBusy}
                size="sm"
                type="button"
                variant="outline"
                onClick={onChooseHeroImage}
              >
                {content.hero.image ? "Change Image" : "Choose Image"}
              </Button>
              <span className="min-w-0 truncate text-xs text-[#817678]">
                {content.hero.image || "No image selected"}
              </span>
            </div>
          </div>

          <TextField
            label="Image Alt"
            disabled={isBusy}
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

        <div className="min-w-0">
          <label className="block text-sm font-semibold text-[#1C2434]">
            Image Preview
          </label>

          <div className="group relative mt-2 overflow-hidden rounded-md border border-[#E2E8F0] bg-[#F1F5F9]">
            {content.hero.image ? (
              <>
                <img
                  src={publicAssetUrl(content.hero.image)}
                  alt={content.hero.imageAlt || "Contact page image"}
                  className="aspect-[4/3] w-full object-cover"
                />

                {onChooseHeroImage ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    className="absolute bottom-3 right-3 rounded-md bg-black/60 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-opacity hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={onChooseHeroImage}
                  >
                    Change Image
                  </button>
                ) : null}
              </>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-[#817678]">
                  <Image size={24} strokeWidth={1.5} />
                  <span className="text-xs">No image selected</span>
                </div>
              </div>
            )}
          </div>

          {content.hero.image && (
            <button
              type="button"
              disabled={isBusy}
              className="mt-2 inline-flex h-9 items-center gap-2 rounded-md border border-[#E2E8F0] bg-white px-3 text-xs font-semibold text-[#64748B] transition-colors hover:border-[#3C50E0]/30 hover:text-[#3C50E0]"
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
              Remove Image
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
