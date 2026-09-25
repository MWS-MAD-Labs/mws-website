import DOMPurify from 'dompurify';
import { Download } from 'lucide-react';

import AdmissionsCta from '@/components/layout/AdmissionsCta';

type RichText = string | string[];

type SectionItem = {
  title: string;
  text: string;
  image: string;
  imageAlt: string;
  imagePosition?: 'left' | 'right';
};

type LevelPageProps = {
  introTitle: string;
  intro: RichText;
  introImage: string;
  introImageAlt: string;

  curriculumTitle: string;
  curriculumDescription: RichText;
  curriculumFile?: string;
  curriculumLabel?: string;

  sections: SectionItem[];

  closingText?: string;
};

function RichTextContent({ content }: { content: RichText }) {
  if (Array.isArray(content)) {
    return (
      <>
        {content.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </>
    );
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content || '') }}
    />
  );
}

export default function LevelPage({
  introTitle,
  intro,
  introImage,
  introImageAlt,
  curriculumTitle,
  curriculumDescription,
  curriculumFile,
  curriculumLabel,
  sections,
  closingText,
}: LevelPageProps) {
  return (
    <main>
      {/* Intro */}
      <section className="subpage-section">
        <div className="wrap">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Text */}
            <div className="subpage-body">
              <h2>{introTitle}</h2>

              <RichTextContent content={intro} />
            </div>

            {/* Image */}
            <div className="overflow-hidden">
              <img
                src={introImage}
                alt={introImageAlt}
                className="block h-full max-h-[420px] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="subpage-section pt-0">
        <div className="wrap">
          <div className="subpage-body max-w-none">
            <h2>{curriculumTitle}</h2>

            <RichTextContent content={curriculumDescription} />

            {/* Download */}
            {curriculumFile && (
              <div className="mt-6 flex justify-end">
                <a
                  href={curriculumFile}
                  download
                  className="inline-flex items-center gap-2 border border-[var(--burgundy)] px-5 py-2.5 text-sm font-medium text-[var(--burgundy)] transition-colors duration-200 hover:bg-[var(--burgundy)] hover:text-white"
                >
                  <Download size={16} strokeWidth={1.8} />
                  Download {curriculumLabel ?? 'Curriculum'}
                </a>
              </div>
            )}

            {/* Divider */}
            <div className="mt-8 border-t border-gray-300" />
          </div>
        </div>
      </section>

      {/* Learning sections */}
      <section className="subpage-section pt-0">
        <div className="wrap">
          <div className="space-y-14">
            {sections.map((section) => {
              const imageRight = section.imagePosition !== 'left';

              return (
                <article
                  key={section.title}
                  className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
                >
                  {/* Text */}
                  <div
                    className={['subpage-body', imageRight ? 'lg:order-1' : 'lg:order-2'].join(' ')}
                  >
                    <h2>{section.title}</h2>

                    <RichTextContent content={section.text} />
                  </div>

                  {/* Image */}
                  <div
                    className={['overflow-hidden', imageRight ? 'lg:order-2' : 'lg:order-1'].join(
                      ' ',
                    )}
                  >
                    <img
                      src={section.image}
                      alt={section.imageAlt}
                      className="block aspect-[4/3] w-full object-cover"
                    />
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Closing */}
      {closingText && (
        <section className="subpage-section pt-0">
          <div className="wrap">
            <div className="mx-auto max-w-4xl border-t border-black/10 pt-8 text-center">
              <RichTextContent content={closingText} />
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <AdmissionsCta
        headline="Ready to begin your journey at MWS?"
        primary={{
          label: 'Start Your Application',
          to: '/admission',
        }}
        secondary={{
          label: 'Visit Our Campus',
          to: '/contact',
        }}
      />
    </main>
  );
}
