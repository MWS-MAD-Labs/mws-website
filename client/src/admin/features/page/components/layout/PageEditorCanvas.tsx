import SectionBlockCard, { AddSectionCard } from "../ui/SectionBlockCard";
import type { PageSection } from "../../config/sections";

type PageEditorCanvasProps = {
  sections: PageSection[];
  selectedSectionId: string;
  onSelectSection: (sectionId: string) => void;
};

export default function PageEditorCanvas({
  onSelectSection,
  sections,
  selectedSectionId,
}: PageEditorCanvasProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {sections.map((section) => (
        <SectionBlockCard
          key={section.id}
          section={section}
          selected={section.id === selectedSectionId}
          onSelect={() => onSelectSection(section.id)}
        />
      ))}
      <AddSectionCard />
    </div>
  );
}
