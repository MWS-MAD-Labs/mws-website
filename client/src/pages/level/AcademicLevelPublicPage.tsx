import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { pageApi, type AcademicLevelData } from '@/api/pageApi';
import ContentBreadcrumb from '@/components/ui/ContentBreadcrumb';
import SupPageHeroAcademic from '@/components/ui/SupPageHeroAcademic';

import LevelPage from './LevelPage';

type AcademicLevelPublicPageProps = {
  fallback: AcademicLevelData;
};

export default function AcademicLevelPublicPage({
  fallback,
}: AcademicLevelPublicPageProps) {
  const location = useLocation();
  const [data, setData] = useState<AcademicLevelData>(fallback);
  const previewDraft = new URLSearchParams(location.search).get('preview') === 'draft';

  useEffect(() => {
    let cancelled = false;

    pageApi
      .academicLevel(fallback.levelKey, { previewDraft })
      .then((nextData) => {
        if (!cancelled) setData(nextData);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [fallback.levelKey, previewDraft]);

  return (
    <>
      <SupPageHeroAcademic
        image={data.page.hero.image}
        imageAlt={data.page.hero.imageAlt}
        title={data.page.hero.title}
        description={data.page.hero.description}
      />

      <ContentBreadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'Academic', path: '/academic' },
          { label: data.page.hero.title },
        ]}
      />

      <LevelPage
        introTitle={data.page.overview.introTitle}
        intro={data.page.overview.intro}
        introImage={data.page.overview.introImage}
        introImageAlt={data.page.overview.introImageAlt}
        curriculumTitle={data.page.overview.curriculumTitle}
        curriculumDescription={data.page.overview.curriculumDescription}
        curriculumFile={data.page.overview.curriculumFile ?? undefined}
        curriculumLabel={data.page.overview.curriculumLabel ?? undefined}
        sections={data.page.sections}
        closingText={data.page.overview.closingText ?? undefined}
      />
    </>
  );
}
