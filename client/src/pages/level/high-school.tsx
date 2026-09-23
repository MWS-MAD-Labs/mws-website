import { asset } from '../../data/site';
import SupPageHeroAcademic from '@/components/ui/SupPageHeroAcademic';

import LevelPage from './LevelPage';
import ContentBreadcrumb from '@/components/ui/ContentBreadcrumb';

export default function HighSchool() {
  return (
    <>
      <SupPageHeroAcademic
        image={asset('JH.jpg')}
        imageAlt="MWS Junior High learning environment"
        title="Junior High"
        description="The secondary pathway helps students strengthen academic confidence, leadership, and readiness for more independent learning."
      />

      <ContentBreadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'Academic', path: '/academic' },
          { label: 'Junior High' },
        ]}
      />

      <LevelPage
        title="Junior High"
        intro="The secondary pathway helps students strengthen academic confidence, leadership, and readiness for more independent learning."
        ageRange="Age 12 - 15"
        focus="Subject depth, inquiry projects, communication, leadership, wellbeing, and preparation for the next academic stage."
        tableRows={[
          [
            'Academics',
            'Depth and discipline',
            'Subject-based projects, seminars, assessment practice, and reflection',
          ],
          [
            'Leadership',
            'Voice and responsibility',
            'Peer collaboration, presentations, service, and student-led initiatives',
          ],
          [
            'Readiness',
            'Independent learning habits',
            'Planning routines, mentoring, and progress conversations',
          ],
        ]}
        activities={[
          {
            title: 'Secondary Inquiry',
            image: asset('_DSC7101.jpg'),
          },
          {
            title: 'Leadership Practice',
            image: asset('JH.jpg'),
          },
          {
            title: 'Project Exhibition',
            image: asset('_DSC7101.jpg'),
          },
        ]}
      />
    </>
  );
}
