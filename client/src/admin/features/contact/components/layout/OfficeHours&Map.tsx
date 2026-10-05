import {
  officeRowsToText,
  textToOfficeRows,
} from "../../utils/contactPageEditorUtils";
import { TextAreaField, TextField } from "./ContactEditorControls";
import type { ContactEditorSectionProps } from "./types";

export default function OfficeHoursMap({
  content,
  isBusy = false,
  updateContent,
}: ContactEditorSectionProps) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[#1C2434]">
        Office Hours & Map
      </h2>
      <TextField
        label="Office Hours Title"
        disabled={isBusy}
        value={content.officeHours.title}
        onChange={(value) =>
          updateContent((current) => ({
            ...current,
            officeHours: { ...current.officeHours, title: value },
          }))
        }
      />
      <div className="mt-4">
        <TextAreaField
          label="Office Hours Items"
          disabled={isBusy}
          rows={5}
          value={officeRowsToText(content.officeHours.items)}
          onChange={(value) =>
            updateContent((current) => ({
              ...current,
              officeHours: {
                ...current.officeHours,
                items: textToOfficeRows(value),
              },
            }))
          }
        />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <TextField
          label="Map Section Title"
          disabled={isBusy}
          value={content.map.title}
          onChange={(value) =>
            updateContent((current) => ({
              ...current,
              map: { ...current.map, title: value },
            }))
          }
        />
        <TextField
          label="Map Iframe Title"
          disabled={isBusy}
          value={content.map.titleAttr}
          onChange={(value) =>
            updateContent((current) => ({
              ...current,
              map: { ...current.map, titleAttr: value },
            }))
          }
        />
      </div>
      <div className="mt-4">
        <TextAreaField
          label="Map Embed URL"
          disabled={isBusy}
          rows={4}
          value={content.map.src}
          onChange={(value) =>
            updateContent((current) => ({
              ...current,
              map: { ...current.map, src: value },
            }))
          }
        />
      </div>
    </div>
  );
}
