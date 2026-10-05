import {
  categoryRowsToText,
  textToCategoryRows,
} from "../../utils/contactPageEditorUtils";
import { TextAreaField, TextField } from "./ContactEditorControls";
import type { ContactEditorSectionProps } from "./types";

export default function ContactForm({
  content,
  isBusy = false,
  updateContent,
}: ContactEditorSectionProps) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[#1C2434]">
        Contact Form
      </h2>
      <TextField
        label="Form Title"
        disabled={isBusy}
        value={content.form.title}
        onChange={(value) =>
          updateContent((current) => ({
            ...current,
            form: { ...current.form, title: value },
          }))
        }
      />
      <div className="mt-4">
        <TextAreaField
          label="Success Message"
          disabled={isBusy}
          value={content.form.successMessage}
          onChange={(value) =>
            updateContent((current) => ({
              ...current,
              form: { ...current.form, successMessage: value },
            }))
          }
        />
      </div>
      <div className="mt-4">
        <TextAreaField
          label="Categories"
          disabled={isBusy}
          rows={5}
          value={categoryRowsToText(content.form.categories)}
          onChange={(value) =>
            updateContent((current) => ({
              ...current,
              form: {
                ...current.form,
                categories: textToCategoryRows(value),
              },
            }))
          }
        />
      </div>
    </div>
  );
}
