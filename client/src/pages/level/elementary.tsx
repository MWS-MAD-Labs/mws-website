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
        introTitle="Building Strong Foundations"
        intro={[
          'Elementary is a time when students build strong academic foundations while becoming increasingly curious, collaborative, and independent learners. At Millennia World School, students are encouraged to explore ideas, ask meaningful questions, and connect their learning with the world around them.',
          'Through a balance of explicit teaching, inquiry, projects, and collaboration, students develop the knowledge, skills, and confidence they need to approach learning with purpose and curiosity.',
        ]}
        introImage={asset('Elementary.jpg')}
        introImageAlt="MWS Elementary students learning together"
        curriculumTitle="Our Curriculum"
        curriculumDescription={[
          'Our Elementary curriculum develops essential skills in literacy, numeracy, science, culture, and communication while giving students opportunities to explore their interests through inquiry and project-based learning.',
          'Students learn to investigate questions, work collaboratively, communicate their ideas, and reflect on their progress. Digital tools are also introduced as part of a balanced learning experience that supports creativity, research, and responsible participation.',
          'Alongside academic development, students build habits of compassion, responsibility, and respect through classroom routines, collaboration, and meaningful connections with the wider school community.',
        ]}
        curriculumFile="/documents/kindergarten-curriculum.pdf"
        curriculumLabel="Elementary Curriculum"
        sections={[
          {
            title: 'Learning Through Collaboration',
            text: 'Students work together to explore questions, solve problems, and create meaningful outcomes. Collaborative projects help learners practice communication, listen to different perspectives, and understand how individual contributions can strengthen a shared result.',
            image: asset('_DSC7101.jpg'),
            imageAlt: 'Elementary students collaborating on a project',
            imagePosition: 'right',
          },
          {
            title: 'Inquiry Beyond the Classroom',
            text: 'Learning extends beyond textbooks and classroom routines. Students investigate their surroundings, observe the world around them, and use questions to guide research, experimentation, and discovery across different areas of learning.',
            image: asset('Elementary.jpg'),
            imageAlt: 'Elementary students exploring their learning environment',
            imagePosition: 'left',
          },
          {
            title: 'Sharing and Reflecting',
            text: 'Students are encouraged to communicate what they have learned through presentations, exhibitions, discussions, and creative work. These experiences help them build confidence while learning to reflect on their progress and identify their next steps.',
            image: asset('DSC09500.jpg'),
            imageAlt: 'Elementary students presenting their learning',
            imagePosition: 'right',
          },
        ]}
        closingText="Elementary provides a supportive environment where students can build strong foundations, discover their interests, and grow into confident and responsible learners."
      />
    </>
  );
}
