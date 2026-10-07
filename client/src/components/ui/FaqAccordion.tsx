import { useState } from "react";
import DOMPurify from "dompurify";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
};

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <div className="faq-accordion">
      {items.map((item, index) => (
        <div
          key={item.question}
          className={`faq-item ${activeIndex === index ? "active" : ""}`}
        >
          <button
            className="faq-trigger"
            type="button"
            onClick={() =>
              setActiveIndex((current) => (current === index ? null : index))
            }
          >
            {item.question}
            <span>+</span>
          </button>
          <div className="faq-content">
            <div
              className="public-rich-text"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(item.answer || ""),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
