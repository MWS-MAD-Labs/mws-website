import CampusInfo from './CampusInfo';
import ContactForm from './ContactForm';
import DirectContact from './DirectContact';
import Hero from './Hero';
import MapSection from './MapSection';
import OfficeHours from './OfficeHours';
import type { ContactEditorSectionProps } from './types';

type ContactMainSectionsProps = ContactEditorSectionProps & {
  onChooseHeroImage: () => void;
  onMapPendingChange: (pending: boolean) => void;
};

// Same order as the public Contact page.
export default function ContactMainSections({
  content,
  isBusy = false,
  onChooseHeroImage,
  updateContent,
  onMapPendingChange,
}: ContactMainSectionsProps) {
  return (
    <div className="min-w-0 space-y-5">
      <Hero
        content={content}
        isBusy={isBusy}
        onChooseHeroImage={onChooseHeroImage}
        updateContent={updateContent}
      />
      <ContactForm content={content} isBusy={isBusy} updateContent={updateContent} />
      <DirectContact content={content} isBusy={isBusy} updateContent={updateContent} />
      <CampusInfo content={content} isBusy={isBusy} updateContent={updateContent} />
      <OfficeHours content={content} isBusy={isBusy} updateContent={updateContent} />
      <MapSection
        content={content}
        isBusy={isBusy}
        updateContent={updateContent}
        onPendingChange={onMapPendingChange}
      />
    </div>
  );
}
