import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { pageApi, type AcademicLevelData } from '@/api/pageApi';
import ProgramCards from '../components/ui/ProgramAcademic';
import SupPageHeroAcademic from '@/components/ui/SupPageHeroAcademic';
import { asset } from '../data/site';
import ContentBreadcrumb from '@/components/ui/ContentBreadcrumb';
import AdmissionsCta from '@/components/layout/AdmissionsCta';

export default function Academic() {
  const [levels, setLevels] = useState<AcademicLevelData[]>([]);

  useEffect(() => {
    let cancelled = false;

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
        image={asset('DSC09500.jpg')}
        imageAlt="MWS academic learning spaces"
        title="Academic"
        description="A connected learning journey that helps students build strong foundations, explore their interests, and grow into confident independent learners."
      />

      <ContentBreadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Academic' }]} />

      {/* Introduction */}
      <section className="subpage-section pt-0">
        <div className="wrap space-y-6">
          {/* Full width */}
          <div className="w-full border-y border-black/10 py-10 md:py-14">
            <h2 className="max-w-4xl text-3xl font-medium leading-tight md:text-5xl">
              Learning should grow with the learner.
            </h2>
          </div>

          {/* Half width */}
          <div className="w-full border-b border-black/10 pb-8 md:w-1/2">
            <p className="text-lg leading-8 text-[var(--charcoal-muted)]">
              At Millennia World School, students build strong academic foundations while gradually
              developing the confidence and independence to take ownership of their learning.
            </p>

            <Link
              to="#academic-programs"
              className="mt-6 inline-flex items-center gap-3 text-sm font-medium text-[var(--burgundy)] transition-colors hover:text-[var(--charcoal)]"
            >
              Explore our programs
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Two columns */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="border-t border-black/10 pt-6">
              <h3 className="mb-4 text-2xl font-medium">Learning through inquiry</h3>

              <p className="max-w-xl leading-7 text-[var(--charcoal-muted)]">
                Students are encouraged to ask questions, explore ideas, collaborate with others,
                and connect their learning with experiences beyond the classroom.
              </p>
            </div>

            <div className="overflow-hidden">
              <img
                src={asset('_DSC7101.jpg')}
                alt="MWS students learning together"
                className="block aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Programs */}
      <ProgramCards programs={programs.length ? programs : undefined} />

      {/* Learning Experience */}
      <section className="subpage-section">
        <div className="wrap">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="overflow-hidden">
              <img
                src={asset('_DSC7101.jpg')}
                alt="MWS students learning together"
                className="block aspect-[4/3] w-full object-cover"
              />
            </div>

            <div className="subpage-body max-w-xl">
              <h2>From guided learning to greater independence.</h2>

              <p>
                Our classrooms give students opportunities to learn through direct instruction,
                inquiry, discussion, projects, and collaboration. Teachers guide students closely
                while gradually giving them more responsibility for their ideas, decisions, and
                progress.
              </p>

              <p>
                This balance allows students to develop strong academic foundations while also
                becoming thoughtful, curious, and responsible learners.
              </p>
            </div>
          </div>
        </div>
      </section>

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
