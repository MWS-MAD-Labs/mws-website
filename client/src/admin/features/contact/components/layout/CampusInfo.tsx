import {
  linesToText,
  textToLines,
} from "../../utils/contactPageEditorUtils";
import { TextAreaField, TextField } from "./ContactEditorControls";
import type { ContactEditorSectionProps } from "./types";

export default function CampusInfo({
  content,
  updateContent,
}: ContactEditorSectionProps) {
  return (
    <div className="rounded-lg border border-[rgba(36,23,24,0.14)] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[#241718]">
        Address
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Title"
          value={content.address.title}
          onChange={(value) =>
            updateContent((current) => ({
              ...current,
              address: { ...current.address, title: value },
            }))
          }
        />
        <TextField
          label="School Name"
          value={content.address.name}
          onChange={(value) =>
            updateContent((current) => ({
              ...current,
              address: { ...current.address, name: value },
            }))
          }
        />
      </div>
      <div className="mt-4">
        <TextAreaField
          label="Address Lines"
          value={linesToText(content.address.lines)}
          onChange={(value) =>
            updateContent((current) => ({
              ...current,
              address: { ...current.address, lines: textToLines(value) },
            }))
          }
        />
      </div>
    </div>
  );
}
