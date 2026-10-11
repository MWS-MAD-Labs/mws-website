import ContentBreadcrumb from "@/components/ui/ContentBreadcrumb";
import SubpageHero from "@/components/ui/SubpageHero";

// Saran: download SVG-nya ke /public/images/mws-logo.svg lalu ganti path ini
const LOGO_SRC =
  "https://millenniaws.sch.id/wp-content/uploads/2021/11/Millennia-World-School-Logo-Only.svg";

// TODO: lengkapi E, S, S (tiga huruf terakhir, tidak terlihat di screenshot)
const HAPPINESS = [
  { letter: "H", label: "Health" },
  { letter: "A", label: "Artistic Ability" },
  { letter: "P", label: "Practical Skills" },
  { letter: "P", label: "Passion" },
  { letter: "I", label: "Intellect" },
  { letter: "N", label: "Naturalistic Ability" },
];

const CORE_VALUES = [
  {
    title: "Truth, Beauty & Goodness",
    points: [
      "Strive to be truthful and transparent in daily work and interactions with each other.",
      "Ensure campus and environment is beautiful/aesthetically pleasing.",
      "Perform acts of goodness towards self and others.",
    ],
  },
  {
    title: "Compassion",
    points: [
      "Showing empathy for others.",
      "Respectful and considerate of others' point of view.",
      "Takes action in helping others irrespective of their race or country.",
    ],
  },
  {
    title: "Joy",
    points: [
      "Seriously enjoying what we do.",
      "Infecting other people with happiness.",
    ],
  },
  {
    title: "Individualized Excellence",
    points: [
      "Consistent focus on performance.",
      "Steadfast in pushing oneself and others for best results.",
      "Takes pride in success.",
    ],
  },
  {
    title: "Social Responsibility & Community Well-being",
    points: [
      "Assume only the best and speak positively about other people.",
      "Show social responsibility for one's actions.",
      "Organizing activities for the community.",
    ],
  },
];

export default function AboutUs() {
  return (
    <main className="bg-white text-[var(--charcoal)]">
      <SubpageHero
        title="Our School"
        image="about-us"
        imageAlt="Millennia World School campus"
      />
      <ContentBreadcrumb
        items={[
          { label: "Home", path: "/" },
          { label: "About MWS" },
          { label: "Our School" },
        ]}
      />

      {/* MWS BACKGROUND */}
      <section className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <h2 className="text-3xl font-bold leading-tight md:text-5xl">
          Learning that is experienced, not just tested.
        </h2>
        <div className="mt-8 space-y-5 text-lg leading-relaxed text-[var(--charcoal)]/80">
          <p>
            In the 21st century, every educational system faces the challenge
            of preparing young generations for a future that is not only
            complex, but constantly changing and mostly unpredictable.
            Intellectual flexibility, creative thinking, independent judgment,
            moral discernment, refined communication skills, and the ability to
            collaborate effectively are essential to success in that world.
          </p>
          <p>
            Millennia World School (MWS) offers a developmentally appropriate,
            experiential approach to education. We use Science to inspire
            artistic thinking and Art to inspire scientific thinking. Each
            subject is interlaced with every other, providing nuance, context
            and deeper meaning. Music, art and movement are as important to the
            curriculum as Math, Science and Languages. Through playful and
            engaging strategies we develop compassionate and critical thinkers,
            in a safe, caring and nurturing environment where children can
            blossom.
          </p>
        </div>
      </section>

      {/* OUR MISSION & OUR VISION (atas-bawah) */}
      <section className="border-y border-[var(--charcoal)]/15">
        <div className="mx-auto max-w-4xl divide-y divide-[var(--charcoal)]/15 px-6">
          <div className="py-12 md:py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--burgundy)]">
              Our Mission
            </p>
            <p className="mt-4 text-2xl font-semibold leading-snug md:text-4xl">
              Discover and foster individual and group potential to achieve
              fulfilling lives.
            </p>
          </div>
          <div className="py-12 md:py-16">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--burgundy)]">
              Our Vision
            </p>
            <p className="mt-4 text-2xl font-semibold leading-snug md:text-4xl">
              A globalized society based on compassion where every individual
              connects to others using their maximum potential through the
              values of Truth, Beauty and Goodness to achieve happiness.
            </p>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY + CORE VALUES */}
      <section
        data-no-aos
        className="relative mx-auto grid max-w-6xl items-stretch md:grid-cols-2"
      >
        {/* The long right column defines the sticky logo's natural release point. */}
        <div className="relative hidden md:block">
          <div className="sticky top-0 flex h-screen items-center justify-center">
            <img
              src={LOGO_SRC}
              alt="Millennia World School logo"
              className="h-80 w-auto"
            />
          </div>
        </div>

        {/* KONTEN KANAN */}
        <div className="bg-[var(--burgundy)] px-8 py-16 text-white md:px-14 md:py-32">
          {/* HAPPINESS */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Our Philosophy
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              H.A.P.P.I.N.E.S.S
            </h2>

            <p className="mt-6 text-lg leading-relaxed text-white/85">
              Our philosophy is based on a profound understanding of human
              development. It addresses the needs of growing children and aims
              at developing their love of learning, sense of meaning and
              purpose. At MWS we emphasize the role of imagination in learning,
              integrating the intellectual, practical and artistic development
              of students.
            </p>

            <ul className="mt-14 space-y-10 md:space-y-16">
              {HAPPINESS.map((item, i) => (
                <li key={i} className="flex items-center gap-6">
                  <span
                    aria-hidden="true"
                    className="w-12 shrink-0 text-center text-5xl font-black leading-none md:w-16 md:text-6xl"
                  >
                    {item.letter}
                  </span>

                  <span className="text-2xl font-bold uppercase tracking-wide md:text-3xl">
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* CORE VALUES */}
          <div className="mt-24 md:mt-48">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
              Core Values
            </p>

            <ul className="mt-6 divide-y divide-white/20 border-y border-white/20">
              {CORE_VALUES.map((value) => (
                <li key={value.title} className="py-10 md:py-14">
                  <h3 className="text-2xl font-bold md:text-3xl">
                    {value.title}
                  </h3>

                  <ul className="mt-5 space-y-2 text-lg text-white/85">
                    {value.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* konten biasa di bawah */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
        <p className="text-xl leading-relaxed text-[var(--charcoal)]/80 md:text-2xl">
          We aim to develop and inspire lifelong learners who fully develop
          their talents, dispositions and capabilities. Through deep,
          meaningful learning experiences, children become trailblazers and
          future leaders. To fulfil this dream, Millennia World School was
          established in 2017.
        </p>
      </section>
    </main>
  );
}
