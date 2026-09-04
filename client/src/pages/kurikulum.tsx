import SubpageHero from "../components/ui/SubpageHero";
import { asset } from "../data/site";

const pillars = [
  {
    title: "Cambridge Framework",
    color: "var(--navy)",
    text: "Nibh non voluptate, feugiat ex lorem nisi sunt esse labore.",
  },
  {
    title: "National Core",
    color: "var(--navy)",
    text: "Exercitation curae qui ullamco sed in tempor vestibulum proident elit.",
  },
  {
    title: "Character & Compassion",
    color: "var(--rose)",
    text: "Do eu eleifend ut anim duis orci ante consequat magna cubilia.",
  },
];

export default function Kurikulum() {
  return (
    <main>
      <SubpageHero
        title="Our Curriculum"
        image={asset("_DSC7101.jpg")}
        imageAlt="MWS Learning and Curriculum"
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "Academics", path: "/academic" },
          { label: "Curriculum" },
        ]}
      />

      <section className="subpage-section">
        <div className="wrap">
          <div className="subpage-grid-2">
            <div className="subpage-body">
              <p className="subpage-intro">
                Vel dolore primis laborum a ut arcu odio deserunt orci qui lorem
                magna, ea quam suscipit.
              </p>
              <p>
                Cupidatat aute reprehenderit cubilia vestibulum dolor ad
                consectetur pariatur fermentum velit. Mollit do in eleifend,
                duis aliqua vitae pretium amet nulla fugiat ultrices officia.
              </p>
              <p>
                Lacus veniam et nostrud laborum, lacus quam cillum pretium.
                Integer ipsum velit tincidunt nulla enim odio vel irure commodo.
              </p>
            </div>

            <div className="mws-panel">
              <h3>The MWS Tri-Pillar Curriculum</h3>
              <ul className="mws-plain-list">
                {pillars.map((pillar, index) => (
                  <li key={pillar.title}>
                    <strong style={{ color: pillar.color }}>
                      {index + 1}. {pillar.title}
                    </strong>
                    <p>{pillar.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        className="subpage-section"
        style={{ background: "var(--charcoal)", color: "var(--warm-white)" }}
      >
        <div className="wrap">
          <h2
            style={{
              color: "var(--white)",
              marginBottom: 60,
              textAlign: "center",
            }}
          >
            Curriculum Component Details
          </h2>

          <div className="mws-card-grid">
            {[
              "Cambridge Pathway",
              "National Alignment",
              "Compassion & Eco-Action",
            ].map((title) => (
              <div className="mws-dark-card" key={title}>
                <h3>{title}</h3>
                <p>
                  Laboris vitae augue aliquip arcu gravida minim posuere. Amet
                  faucibus consectetur mollit dolor excepteur, nulla fugiat sit
                  ea eiusmod cupidatat ad dolore.
                </p>
                <ul>
                  <li>English Language Acquisition</li>
                  <li>Applied and laboratory sciences</li>
                  <li>Collaborative empathy exercises</li>
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
