import {
  Bot,
  CalendarDays,
  FileText,
  FormInput,
  Image,
  Layers3,
  MapPinned,
  Pencil,
  Plus,
  Rows3,
  Table2,
} from "lucide-react";
import Button from "@/admin/components/ui/Button";
import type { PageSection } from "../../config/sections";

type SectionBlockCardProps = {
  section: PageSection;
  selected: boolean;
  onSelect: () => void;
};

function SectionPreview({ section }: { section: PageSection }) {
  if (section.preview === "image" && section.image) {
    return (
      <img
        src={section.image}
        alt=""
        className="h-full w-full object-cover"
        aria-hidden="true"
      />
    );
  }

  if (section.preview === "cards") {
    return (
      <div className="grid h-full grid-cols-3 gap-2 p-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="overflow-hidden rounded-md border border-white/60 bg-white/80"
          >
            <div className="h-9 bg-[#d9c49a]" />
            <div className="space-y-1.5 p-2">
              <span className="block h-1.5 rounded-full bg-[#7e1518]/50" />
              <span className="block h-1.5 w-2/3 rounded-full bg-[#241718]/18" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (section.preview === "form") {
    return (
      <div className="grid h-full gap-2 p-4">
        <span className="h-3 rounded-md bg-[#241718]/16" />
        <span className="h-8 rounded-md border border-[#241718]/14 bg-white" />
        <span className="h-8 rounded-md border border-[#241718]/14 bg-white" />
        <span className="h-8 rounded-md bg-[#7e1518]" />
      </div>
    );
  }

  if (section.preview === "calendar") {
    return (
      <div className="grid h-full grid-cols-7 gap-1 p-4">
        {Array.from({ length: 28 }, (_, index) => (
          <span
            key={index}
            className={`rounded-sm ${
              [6, 12, 18].includes(index)
                ? "bg-[#7e1518]"
                : "bg-white"
            } border border-[#241718]/10`}
          />
        ))}
      </div>
    );
  }

  if (section.preview === "article") {
    return (
      <div className="grid h-full grid-cols-[72px_1fr] gap-3 p-4">
        <span className="rounded-md bg-[#d9c49a]" />
        <div className="space-y-2">
          <span className="block h-2 rounded-full bg-[#7e1518]/60" />
          <span className="block h-2 rounded-full bg-[#241718]/18" />
          <span className="block h-2 rounded-full bg-[#241718]/18" />
          <span className="block h-2 w-2/3 rounded-full bg-[#241718]/14" />
        </div>
      </div>
    );
  }

  if (section.preview === "table") {
    return (
      <div className="grid h-full grid-rows-4 gap-1 p-4">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="grid grid-cols-3 gap-1">
            {[0, 1, 2].map((cell) => (
              <span
                key={`${row}-${cell}`}
                className={`rounded-sm ${
                  row === 0 ? "bg-[#7e1518]/70" : "bg-white"
                } border border-[#241718]/10`}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (section.preview === "map") {
    return (
      <div className="relative h-full bg-[#e6dcc8] p-4">
        <span className="absolute left-8 top-5 h-20 w-px rotate-45 bg-white/80" />
        <span className="absolute right-12 top-0 h-28 w-px -rotate-45 bg-white/80" />
        <span className="absolute bottom-7 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-[#7e1518] text-white">
          <MapPinned size={18} />
        </span>
      </div>
    );
  }

  if (section.preview === "logos") {
    return (
      <div className="grid h-full grid-cols-3 gap-2 p-4">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <span
            key={item}
            className="rounded-md border border-[#d9c49a]/60 bg-white"
          />
        ))}
      </div>
    );
  }

  if (section.preview === "chat") {
    return (
      <div className="flex h-full items-end justify-end p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#7e1518] text-white shadow-sm">
          <Bot size={22} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center p-5">
      <div className="w-full max-w-[190px] space-y-2">
        <span className="block h-2 rounded-full bg-[#7e1518]/60" />
        <span className="block h-2 rounded-full bg-[#241718]/20" />
        <span className="block h-2 w-3/4 rounded-full bg-[#241718]/14" />
      </div>
    </div>
  );
}

function SectionIcon({ preview }: { preview: PageSection["preview"] }) {
  if (preview === "image") return <Image size={16} />;
  if (preview === "cards") return <Layers3 size={16} />;
  if (preview === "logos") return <Rows3 size={16} />;
  if (preview === "chat") return <Bot size={16} />;
  if (preview === "form") return <FormInput size={16} />;
  if (preview === "calendar") return <CalendarDays size={16} />;
  if (preview === "article") return <FileText size={16} />;
  if (preview === "table") return <Table2 size={16} />;
  if (preview === "map") return <MapPinned size={16} />;
  return <Rows3 size={16} />;
}

export default function SectionBlockCard({
  onSelect,
  section,
  selected,
}: SectionBlockCardProps) {
  return (
    <article
      className={[
        "group rounded-lg border bg-white shadow-sm transition-[border-color,box-shadow,transform]",
        selected
          ? "border-[#7e1518] shadow-[0_14px_34px_rgba(126,21,24,0.16)]"
          : "border-[rgba(36,23,24,0.14)] hover:-translate-y-0.5 hover:border-[#7e1518]/45 hover:shadow-[0_14px_30px_rgba(36,23,24,0.1)]",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={onSelect}
        className="block w-full cursor-pointer text-left"
        aria-pressed={selected}
      >
        <div className="h-36 overflow-hidden rounded-t-lg bg-[#faf8f3]">
          <SectionPreview section={section} />
        </div>
      </button>

      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#7e1518]">
              <SectionIcon preview={section.preview} />
              <span>{section.type}</span>
            </div>
            <h2 className="mt-1 text-base font-semibold text-[#241718]">
              {section.name}
            </h2>
            <p className="mt-1 text-sm text-[#625759]">{section.summary}</p>
          </div>
        </div>

        <Button
          size="sm"
          variant={selected ? "primary" : "outline"}
          className="inline-flex items-center gap-2"
          onClick={onSelect}
        >
          <Pencil size={14} />
          <span>Edit</span>
        </Button>
      </div>
    </article>
  );
}

export function AddSectionCard() {
  return (
    <button
      type="button"
      className="flex min-h-[252px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[rgba(36,23,24,0.28)] bg-white p-6 text-[#625759] transition-colors hover:border-[#7e1518] hover:bg-[#7e1518]/5 hover:text-[#7e1518]"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-current">
        <Plus size={20} />
      </span>
      <span className="mt-3 text-sm font-semibold">Add Section</span>
    </button>
  );
}
