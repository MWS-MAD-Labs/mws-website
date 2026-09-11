import {
  officeRowsToText,
  textToOfficeRows,
} from "../../utils/contactPageEditorUtils";
import { TextAreaField, TextField } from "./ContactEditorControls";
import type { ContactEditorSectionProps } from "./types";

export default function OfficeHoursMap({
  content,
  updateContent,
}: ContactEditorSectionProps) {
  return (
    <div className="rounded-lg border border-[rgba(36,23,24,0.14)] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[#241718]">
        Office Hours & Map
      </h2>
      <TextField
        label="Office Hours Title"
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
