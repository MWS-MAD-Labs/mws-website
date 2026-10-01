import ContactPageView from "@/features/contact/components/ContactPageView";
import type { ContactPageContent } from "@/features/contact/contactPageData";

type ContactPagePreviewProps = {
  content: ContactPageContent;
};

export default function ContactPagePreview({ content }: ContactPagePreviewProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm">
      <div className="max-h-[760px] overflow-auto bg-white">
        <ContactPageView content={content} preview />
      </div>
    </div>
  );
}
