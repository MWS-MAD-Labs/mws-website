import CampusInfo from './CampusInfo';
import ContactForm from './ContactForm';
import DirectContact from './DirectContact';
import Hero from './Hero';
import OfficeHoursMap from './OfficeHours&Map';
import type { ContactEditorSectionProps } from './types';

export default function ContactMainSections({
  content,
  isBusy = false,
  updateContent,
}: ContactEditorSectionProps) {
  return (
    <div className="min-w-0 space-y-5">
      <Hero content={content} isBusy={isBusy} updateContent={updateContent} />
      <DirectContact content={content} isBusy={isBusy} updateContent={updateContent} />
      <CampusInfo content={content} isBusy={isBusy} updateContent={updateContent} />
      <OfficeHoursMap content={content} isBusy={isBusy} updateContent={updateContent} />
      <ContactForm content={content} isBusy={isBusy} updateContent={updateContent} />
    </div>
  );
}
