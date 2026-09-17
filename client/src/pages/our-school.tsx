import SubpageHero from '../components/ui/SubpageHero';
import ContentBreadcrumb from '../components/ui/ContentBreadcrumb';
import EditorialSplit from '../components/ui/EditorialSplit';
import EditorialFeature from '../components/ui/EditorialFeature';
import EditorialText from '../components/ui/EditorialText';
import FaqSection from '../components/ui/FaqSection';
import { asset } from '../data/site';

const faqItems = [
  {
    question: 'What learning programs does MWS offer?',
    answer:
      'Millennia World School offers learning programs designed to support students across different stages of their educational journey. More detailed program information will be provided through the relevant academic pages.',
  },
  {
    question: 'How does MWS approach student learning?',
    answer:
      'Our approach focuses on developing students academically while also supporting their personal, social, and practical development through meaningful learning experiences.',
  },
  {
    question: 'What makes the MWS learning environment different?',
    answer:
      'MWS aims to create a learning environment where students are encouraged to explore ideas, collaborate with others, develop confidence, and connect their learning with the world around them.',
  },
  {
    question: 'How can I learn more about MWS?',
    answer:
      'You can explore our academic programs, school information, and community stories through this website or contact the school directly for further information.',
  },
];

export default function OurSchool() {
  return (
    <main>
      <SubpageHero
        title="Our School"
        image={asset('DSC04079.jpg')}
        imageAlt="Millennia World School Campus"
      />

      {/* Breadcrumb */}
      <ContentBreadcrumb
        items={[{ label: 'Home', path: '/' }, { label: 'About MWS' }, { label: 'Our School' }]}
      />

      {/* MWS Background */}
      <EditorialSplit
        title="MWS Background"
        image={asset('DSC04079.jpg')}
        imageAlt="Millennia World School campus"
        imagePosition="right"
      >
        <p>
          In the 21st century, every educational system faces the challenge of preparing young
          generations for a life of the future that is not only complex, but constantly changing as
          well, and hence, mostly unknown and unpredictable. However, it is clear that intellectual
          flexibility, creative thinking, independent judgment, moral discernment, refined written
          and oral communication skills, and the ability to collaborate effectively are essential to
          success in today’s ever changing world. Millennia World School(MWS) offers a
          developmentally appropriate, experiential approach towards education. We use Science to
          inspire artistic thinking and Art to inspire scientific thinking. Each subject is
          interlaced with every other subject while providing nuance, context and deeper meaning for
          each. Music, art and movement are as important to the curriculum as Math, Science and
          Languages. Through playful and engaging learning strategies we develop and create
          compassionate and critical thinkers. We also provide a safe, caring and nurturing
          environment in order for children to blossom.
        </p>
        <p>
          We aim to develop and inspire lifelong learners and enable them to fully develop their
          talents, dispositions and capabilities. Millennia World School’s Education is based on the
          principle that the subjects are not meant just to be read and tested on, but rather to be
          experienced. Through these deep, meaningful learning experiences children develop and
          cultivate intellectual, emotional, physical capabilities to become individuals who are
          trailblazers and future leaders. To fulfil this dream, MIllennia World School was
          established in 2017.
        </p>
      </EditorialSplit>

      {/* Vision & Mission */}
      <EditorialFeature
        title="Our Vision & Mission"
        image={asset('DSC04079.jpg')}
        imageAlt="Students learning at Millennia World School"
      >
        <p>Discover and foster individual and group potential to achieve fulfilling lives.</p>

        <p>
          A globalized society based on compassion where every individual connects to others using
          their maximum potential through the values of Truth, Beauty and Goodness to achieve
          happiness.
        </p>
      </EditorialFeature>

      {/* Philosophy */}
      <EditorialText title="Our Philosophy">
        <p>
          Our Philosophy is based on profound understanding of human development that addresses the
          needs of growing children and aims at developing their love of learning, sense of meaning
          and purpose. At MWS, we emphasize the role of imagination in learning, striving to
          integrate holistically the intellectual, practical, and artistic development of students.
          At the heart of our philosophy lies the concept of H.A.P.P.I.N.E.S.S that covers the
          development of following aspects:
        </p>

        <p>
          We aim to develop and inspire lifelong learners and enable them to fully develop their
          talents, dispositions and capabilities. Millennia World School’s Education is based on the
          principle that the subjects are not meant just to be read and tested on, but rather to be
          experienced. Through these deep, meaningful learning experiences children develop and
          cultivate intellectual, emotional, physical capabilities to become individuals who are
          trailblazers and future leaders. To fulfill this dream, Millennia World School was
          established in 2017.
        </p>
      </EditorialText>

      {/* FAQ */}
      <FaqSection items={faqItems} />
    </main>
  );
}
