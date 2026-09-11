import type { FormEvent } from "react";
import { Save } from "lucide-react";
import Button from "@/admin/components/ui/Button";
import type { ContactPageContent } from "@/features/contact/contactPageData";
import CampusInfo from "./layout/CampusInfo";
import ContactForm from "./layout/ContactForm";
import DirectContact from "./layout/DirectContact";
import Hero from "./layout/Hero";
import OfficeHoursMap from "./layout/OfficeHours&Map";

type ContactEditorFieldsProps = {
  content: ContactPageContent;
  isLoading: boolean;
  isSaving: boolean;
  onSave: () => Promise<void>;
  updateContent: (
    updater: (current: ContactPageContent) => ContactPageContent,
  ) => void;
};

export default function ContactEditorFields({
  content,
  isLoading,
  isSaving,
  onSave,
  updateContent,
}: ContactEditorFieldsProps) {
  const saveContent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSave();
  };

  return (
    <form onSubmit={saveContent} className="space-y-5">
      <Hero content={content} updateContent={updateContent} />
      <ContactForm content={content} updateContent={updateContent} />
      <CampusInfo content={content} updateContent={updateContent} />
      <DirectContact content={content} updateContent={updateContent} />
      <OfficeHoursMap content={content} updateContent={updateContent} />

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving || isLoading}
          className="inline-flex items-center gap-2"
        >
          <Save size={15} />
          <span>{isSaving ? "Saving..." : "Save Contact Page"}</span>
        </Button>
      </div>
    </form>
  );
}
