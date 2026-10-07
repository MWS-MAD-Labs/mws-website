import AdmissionsCta from '@/components/layout/AdmissionsCta';
import ContentBreadcrumb from '@/components/ui/ContentBreadcrumb';
import AdmissionHero from '@/features/admissions/components/AdmissionHero';
import AdmissionInfoTiles from '@/features/admissions/components/AdmissionInfoTiles';
import AdmissionIntro from '@/features/admissions/components/AdmissionIntro';
import AdmissionProcess from '@/features/admissions/components/AdmissionProcess';
import { useAdmissionPage } from '@/features/admissions/hooks/useAdmissionPage';

export default function Admission() {
  const { content, generalHref, loadError, programs } = useAdmissionPage();

  return (
    <main>
      {loadError ? (
        <p className="sr-only" role="status">
          {loadError}
        </p>
      ) : null}

      <AdmissionHero content={content} generalHref={generalHref} />

      <ContentBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Admission' }]} />

      <AdmissionIntro content={content} generalHref={generalHref} programs={programs} />

      <AdmissionProcess
        steps={content.steps}
        title={content.processTitle}
      />

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

      <AdmissionInfoTiles tiles={content.infoTiles} />
    </main>
  );
}
