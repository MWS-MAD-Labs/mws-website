import { asset } from '../../data/site';

import SupPageHeroAcademic from '@/components/ui/SupPageHeroAcademic';
import ContentBreadcrumb from '@/components/ui/ContentBreadcrumb';

import LevelPage from './LevelPage';

export default function Kindergarten() {
  return (
    <>
      <SupPageHeroAcademic
        image={asset('Kindergarten.jpg')}
        imageAlt="MWS Kindergarten learning environment"
        title="Kindergarten"
        description="The early years program supports curiosity, language, social confidence, and joyful independence through play-based inquiry."
      />

      <ContentBreadcrumb
        items={[
          { label: 'Home', path: '/' },
          { label: 'Academic', path: '/academic' },
          { label: 'Kindergarten' },
        ]}
      />

      <LevelPage
        introTitle="Growing Through Discovery"
        intro={[
          'The early years are a time of wonder, curiosity, and rapid growth. At Millennia World School, children are encouraged to explore their surroundings, ask questions, and build meaningful relationships in a warm and supportive environment.',
          'Learning happens through play, conversation, movement, creative expression, and hands-on experiences. These experiences help children develop confidence while building the foundations they need for their next stage of learning.',
        ]}
        introImage={asset('Kindergarten.jpg')}
        introImageAlt="Kindergarten students exploring their learning environment"
        curriculumTitle="Our Curriculum"
        curriculumDescription={[
          'Our Kindergarten curriculum provides a balance of guided learning and open-ended exploration. Children develop early literacy and numeracy skills while learning to communicate, collaborate, solve problems, and make sense of the world around them.',
          'Through an inquiry-based approach, teachers create opportunities for children to investigate ideas, express their thinking, and connect new experiences with what they already know.',
          'Our approach recognizes that every child develops at their own pace, with learning experiences designed to nurture curiosity, confidence, independence, and a genuine love of learning.',
        ]}
        curriculumFile="/documents/kindergarten-curriculum.pdf"
        curriculumLabel="Kindergarten Curriculum"
        sections={[
          {
            title: 'Learning Through Play',
            text: 'Play is an important part of how young children make sense of the world. Through purposeful play, children develop language, early mathematical thinking, creativity, coordination, and social skills while learning to make choices and solve simple problems.',
            image: asset('Kindergarten.jpg'),
            imageAlt: 'Kindergarten students learning through play',
            imagePosition: 'right',
          },
          {
            title: 'Growing Independence',
            text: 'Daily routines give children opportunities to take responsibility for themselves and their learning. From caring for personal belongings to working with friends and expressing their ideas, children gradually develop confidence, independence, and a sense of responsibility.',
            image: asset('_DSC7101.jpg'),
            imageAlt: 'Kindergarten students participating in a classroom activity',
            imagePosition: 'left',
          },
        ]}
        closingText="Every experience in Kindergarten is designed to help children become curious learners, confident communicators, and caring members of their community."
      />
    </>
  );
}
