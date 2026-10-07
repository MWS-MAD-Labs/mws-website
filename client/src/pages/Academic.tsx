import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { Link } from 'react-router-dom';

import {
  pageApi,
  type AcademicLevelData,
  type AcademicOverviewPageData,
} from '@/api/pageApi';
import ProgramCards from '../components/ui/ProgramAcademic';
import SupPageHeroAcademic from '@/components/ui/SupPageHeroAcademic';
import { asset } from '../data/site';
import ContentBreadcrumb from '@/components/ui/ContentBreadcrumb';
import AdmissionsCta from '@/components/layout/AdmissionsCta';

const defaultOverview: AcademicOverviewPageData = {
  title: 'Academic',
  description:
    'A connected learning journey that helps students build strong foundations, explore their interests, and grow into confident independent learners.',
  coverImage: asset('DSC09500.jpg'),
  content: {
    intro: {
      title: 'Learning should grow with the learner.',
      body:
        '<p>At Millennia World School, students build strong academic foundations while gradually developing the confidence and independence to take ownership of their learning.</p>',
      image: asset('_DSC7101.jpg'),
      imageAlt: 'MWS students learning together',
    },
    experience: {
      title: 'From guided learning to greater independence.',
      body:
        '<p>Strong foundations come first. Curiosity and responsibility grow alongside them.</p>',
      image: asset('DSC04079.jpg'),
      imageAlt: 'MWS classroom activity',
    },
    approach: [
      {
        title: 'Learning through inquiry',
        body:
          'Students ask questions, explore ideas, collaborate with others, and connect what they learn with experiences beyond the classroom.',
      },
      {
        title: 'Guided at first, independent over time',
        body:
          'Teachers guide students closely, then gradually hand over more responsibility for their ideas, decisions, and progress.',
      },
      {
        title: 'Many ways to learn',
        body:
          'Direct instruction, discussion, projects, and teamwork all have a place in the classroom, so every student has room to grow.',
      },
    ],
  },
  galleryId: null,
};

function RichTextBlock({ content }: { content: string }) {
  return (
    <div
      className="public-rich-text"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(content || ''),
      }}
    />
  );
}

export default function Academic() {
  const [levels, setLevels] = useState<AcademicLevelData[]>([]);
  const [overview, setOverview] = useState<AcademicOverviewPageData>(defaultOverview);

  useEffect(() => {
    let cancelled = false;

    pageApi
      .academicOverview()
      .then((data) => {
        if (!cancelled) {
          setOverview({
            ...defaultOverview,
            ...data,
            description: data.description || defaultOverview.description,
            coverImage: data.coverImage || defaultOverview.coverImage,
            content: {
              intro: {
                ...defaultOverview.content.intro,
                ...(data.content?.intro ?? {}),
              },
              experience: {
                ...defaultOverview.content.experience,
                ...(data.content?.experience ?? {}),
              },
              approach: data.content?.approach?.length
                ? data.content.approach
                : defaultOverview.content.approach,
            },
          });
        }
      })
      .catch(() => undefined);

    pageApi
      .academicLevels()
      .then((items) => {
        if (!cancelled) setLevels(items);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  const programs = levels
    .filter((level) => level.program.isActive)
    .map((level) => ({
      id: level.levelKey,
      title: level.program.title,
      age: level.program.age ?? '',
      description: level.program.description ?? '',
      image: level.program.image || asset('DSC04079.jpg'),
      path: level.program.path || `/academic/${level.levelKey}`,
    }));

  return (
    <main>
      <SupPageHeroAcademic
        image={overview.coverImage || defaultOverview.coverImage || asset('DSC09500.jpg')}
        imageAlt="MWS academic learning spaces"
        title={overview.title || defaultOverview.title}
        description={overview.description || defaultOverview.description || ''}
      />

      <ContentBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Academic' }]} />

      {/* Introduction: headline left, supporting text right, wide photo below */}
      <section className="subpage-section !pt-6 sm:!pt-8 md:!pt-10">
        <div className="wrap">
          <div className="grid gap-6 border-t border-black/10 pt-6 sm:gap-8 sm:pt-8 md:pt-12 lg:grid-cols-12 lg:gap-16">
            <h2 className="text-3xl font-medium leading-tight md:text-5xl lg:col-span-7">
              {overview.content.intro.title}
            </h2>

            <div className="lg:col-span-5 lg:pt-3">
              <div className="text-lg leading-8 text-[var(--charcoal-muted)]">
                <RichTextBlock content={overview.content.intro.body} />
              </div>

              <a
                href="#academic-programs"
                className="mt-6 inline-flex items-center gap-3 text-sm font-medium text-[var(--burgundy)] transition-colors hover:text-[var(--charcoal)]"
              >
                Find the right program
                <span aria-hidden="true">↓</span>
              </a>
            </div>
          </div>

          <div className="mt-10 overflow-hidden md:mt-14">
            <img
              src={overview.content.intro.image || defaultOverview.content.intro.image}
              alt={overview.content.intro.imageAlt}
              className="block aspect-[4/3] w-full object-cover md:aspect-[21/9]"
            />
          </div>
        </div>
      </section>

      {/* Age pathway: quick way for parents to find their child's stage */}
      {programs.length > 0 && (
        <section className="subpage-section pt-0" aria-labelledby="academic-pathway-title">
          <div className="wrap">
            <div className="mb-8 max-w-2xl">
              <h2 id="academic-pathway-title" className="text-2xl font-medium md:text-4xl">
                Where does your child fit?
              </h2>
              <p className="mt-3 leading-7 text-[var(--charcoal-muted)]">
                Choose a stage to see what learning looks like at each age.
              </p>
            </div>

            <ol className="grid grid-cols-1 border-y border-black/10 sm:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col">
              {programs.map((program) => (
                <li
                  key={program.id}
                  className="border-b border-black/10 last:border-b-0 sm:odd:border-r lg:border-b-0 lg:border-r lg:last:border-r-0"
                >
                  <Link
                    to={program.path}
                    className="group block h-full px-5 py-6 transition-colors hover:bg-black/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--burgundy)]"
                  >
                    {program.age && (
                      <span className="block text-sm text-[var(--charcoal-muted)]">
                        {program.age}
                      </span>
                    )}
                    <span className="mt-1 block text-xl font-medium group-hover:text-[var(--burgundy)]">
                      {program.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* How we teach */}
      <section className="subpage-section">
        <div className="wrap">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <h2 className="text-3xl font-medium leading-tight md:text-4xl">
                {overview.content.experience.title}
              </h2>
              <div className="mt-5 max-w-md leading-7 text-[var(--charcoal-muted)]">
                <RichTextBlock content={overview.content.experience.body} />
              </div>
              <div className="mt-8 hidden overflow-hidden lg:block">
                <img
                  src={
                    overview.content.experience.image ||
                    defaultOverview.content.experience.image
                  }
                  alt={overview.content.experience.imageAlt}
                  className="block aspect-[4/5] w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <ul className="divide-y divide-black/10 border-y border-black/10 lg:col-span-7 lg:self-start">
              {overview.content.approach.map((item) => (
                <li key={item.title} className="py-8 md:py-10">
                  <h3 className="text-xl font-medium md:text-2xl">{item.title}</h3>
                  <p className="mt-3 max-w-xl leading-7 text-[var(--charcoal-muted)]">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Programs */}
      <div id="academic-programs" className="scroll-mt-24">
        <ProgramCards programs={programs.length ? programs : undefined} />
      </div>

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
