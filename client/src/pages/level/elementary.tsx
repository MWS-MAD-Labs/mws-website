import { asset } from '../../data/site';

import SupPageHeroAcademic from '@/components/ui/SupPageHeroAcademic';
import ContentBreadcrumb from '@/components/ui/ContentBreadcrumb';

import LevelPage from './LevelPage';

export default function Elementary() {
  return (
    <>
      <SupPageHeroAcademic
        image={asset('Elementary.jpg')}
        imageAlt="MWS Elementary learning environment"
        title="Elementary"
        description="Elementary learners build strong academic foundations while practicing inquiry, collaboration, and independence."
      />

      <ContentBreadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'Academic', path: '/academic' },
          { label: 'Elementary' },
        ]}
      />

      <LevelPage
        title="Elementary"
        intro="Elementary learners build strong academic foundations while practicing inquiry, collaboration, and independence."
        ageRange="Age 6 - 12"
        focus="Literacy, numeracy, science, culture, project learning, digital confidence, and community habits."
        tableRows={[
          [
            'Core Skills',
            'Literacy and numeracy fluency',
            'Small-group workshops, guided practice, and teacher feedback',
          ],
          [
            'Inquiry',
            'Questions across disciplines',
            'STEAM investigations, research routines, and presentations',
          ],
          [
            'Character',
            'Compassion and responsibility',
            'Class agreements, service moments, and reflection circles',
          ],
        ]}
        activities={[
          {
            title: 'Collaborative Projects',
            image: asset('_DSC7101.jpg'),
          },
          {
            title: 'Campus Inquiry',
            image: asset('Elementary.jpg'),
          },
          {
            title: 'Exhibition Practice',
            image: asset('DSC09500.jpg'),
          },
        ]}
      />
    </>
  );
}
