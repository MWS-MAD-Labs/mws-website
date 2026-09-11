import type { FormEvent } from "react";
import ContactPageView from "@/features/contact/components/ContactPageView";
import type { ContactPageContent } from "@/features/contact/contactPageData";

type ContactPagePreviewProps = {
  content: ContactPageContent;
};

export default function ContactPagePreview({ content }: ContactPagePreviewProps) {
  const preventPreviewSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="overflow-hidden rounded-lg border border-[rgba(36,23,24,0.14)] bg-white shadow-sm">
      <div className="max-h-[760px] overflow-auto bg-white">
        <ContactPageView
          content={content}
          preview
          onSubmit={preventPreviewSubmit}
        />
      </div>
    </div>
  );
}
