import { TextField } from "./ContactEditorControls";
import type { ContactEditorSectionProps } from "./types";

export default function DirectContact({
  content,
  isBusy = false,
  updateContent,
}: ContactEditorSectionProps) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-[#1C2434]">
        Contact Information
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          label="Title"
          disabled={isBusy}
          value={content.directContacts.title}
          onChange={(value) =>
            updateContent((current) => ({
              ...current,
              directContacts: { ...current.directContacts, title: value },
            }))
          }
        />
        <TextField
          label="Heading"
          disabled={isBusy}
          value={content.directContacts.heading}
          onChange={(value) =>
            updateContent((current) => ({
              ...current,
              directContacts: { ...current.directContacts, heading: value },
            }))
          }
        />
        <TextField
          label="Phone"
          disabled={isBusy}
          value={content.directContacts.phone}
          onChange={(value) =>
            updateContent((current) => ({
              ...current,
              directContacts: { ...current.directContacts, phone: value },
            }))
          }
        />
        <TextField
          label="WhatsApp"
          disabled={isBusy}
          value={content.directContacts.whatsapp}
          onChange={(value) =>
            updateContent((current) => ({
              ...current,
              directContacts: { ...current.directContacts, whatsapp: value },
            }))
          }
        />
        <TextField
          label="Email"
          disabled={isBusy}
          value={content.directContacts.email}
          onChange={(value) =>
            updateContent((current) => ({
              ...current,
              directContacts: { ...current.directContacts, email: value },
            }))
          }
        />
      </div>
    </div>
  );
}
