import type { AdmissionProgramData } from '@/api/pageApi';
import type { AdmissionPageContent } from '@/features/admissions/admissionPageData';

import AdmissionSidebar from './AdmissionSidebar';
import IntroMediaView from './IntroMediaView';

type AdmissionIntroProps = {
  content: AdmissionPageContent;
  generalHref: string;
  programs: AdmissionProgramData[];
};

export default function AdmissionIntro({ content, generalHref, programs }: AdmissionIntroProps) {
  return (
    <section className="subpage-section !pt-8 sm:!pt-10 md:!pt-12">
      <div className="wrap grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16">
        <div className="min-w-0">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              {content.introTitle}
            </h2>
            <div className="mt-5 space-y-4 text-base leading-8 text-[var(--charcoal-muted)] sm:mt-6 sm:space-y-5 sm:text-lg">
              {content.introBody.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <IntroMediaView media={content.introMedia} />
        </div>

        <AdmissionSidebar
          generalHref={generalHref}
          menuTitle={content.menuTitle}
          programs={programs}
          readyTitle={content.readyTitle}
        />
      </div>
    </section>
  );
}
