import type { ContactPageContent } from "@/features/contact/contactPageData";

export type ContactContentUpdater = (
  updater: (current: ContactPageContent) => ContactPageContent,
) => void;

export type ContactEditorSectionProps = {
  content: ContactPageContent;
  updateContent: ContactContentUpdater;
};
