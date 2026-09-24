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
        introTitle="Growing Into Independence"
        intro={[
          'Junior High is a time when students begin to take greater ownership of their learning, interests, and personal development. At Millennia World School, students are supported as they build confidence while navigating a broader and more challenging academic experience.',
          'Learning combines subject knowledge with inquiry, collaboration, communication, and reflection. Students are encouraged to ask deeper questions, take responsibility for their choices, and develop the independence needed for the next stage of their education.',
        ]}
        introImage={asset('JH.jpg')}
        introImageAlt="MWS Junior High students learning together"
        curriculumTitle="Our Curriculum"
        curriculumDescription={[
          'Our Junior High curriculum provides students with a balanced academic experience that develops subject knowledge, critical thinking, communication, and independent learning habits.',
          'Through projects, discussions, research, and collaborative learning, students are encouraged to connect ideas across subjects and apply their learning to meaningful situations.',
          'The program also creates opportunities for students to develop leadership, responsibility, wellbeing, and a growing awareness of their role within the wider community.',
        ]}
        curriculumFile="/documents/kindergarten-curriculum.pdf"
        curriculumLabel="Junior High Curriculum"
        sections={[
          {
            title: 'Learning With Greater Independence',
            text: 'Students take a more active role in planning, managing, and reflecting on their learning. They develop stronger study habits while learning to communicate their ideas, respond to feedback, and take responsibility for their progress.',
            image: asset('_DSC7101.jpg'),
            imageAlt: 'Junior High students collaborating on a learning activity',
            imagePosition: 'right',
          },
          {
            title: 'Leadership and Responsibility',
            text: 'Junior High students are given opportunities to develop leadership through collaboration, presentations, service, and student-led initiatives. These experiences help them understand how their choices can contribute positively to the school community.',
            image: asset('JH.jpg'),
            imageAlt: 'Junior High students participating in a collaborative activity',
            imagePosition: 'left',
          },
          {
            title: 'Preparing for the Next Stage',
            text: 'As students move toward their next academic pathway, they strengthen the habits and skills needed for more independent learning. Mentoring, reflection, project work, and progress conversations help students understand their strengths and identify areas for growth.',
            image: asset('_DSC7101.jpg'),
            imageAlt: 'Junior High students working on a project',
            imagePosition: 'right',
          },
        ]}
        closingText="Junior High helps students grow into confident, responsible, and increasingly independent learners who are ready to take on new academic and personal challenges."
      />
    </>
  );
}
