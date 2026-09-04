import SubpageHero from "../components/ui/SubpageHero";
import { asset } from "../data/site";

const values = [
  ["Curiosity", "Id officia nisi minim a, ut aliquip in amet. Curabitur cupidatat dolor et laboris integer."],
  ["Compassion", "Qui magna quis, anim vestibulum culpa ante consequat. Ex vel ullamco commodo dolore nibh ultrices laborum."],
  ["Collaboration", "Aute fermentum officia aliqua ad quam luctus cubilia adipiscing pariatur primis reprehenderit fugiat occaecat."],
  ["Mindfulness", "Excepteur eleifend sunt gravida posuere consectetur nulla odio, enim incididunt veniam voluptate."],
];

export default function OurSchool() {
  return (
    <main>
      <SubpageHero
        title="Our School"
        image={asset("DSC04079.jpg")}
        imageAlt="Millennia World School Campus"
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "About MWS" },
          { label: "Our School" },
        ]}
      />

      <section className="subpage-section">
        <div className="wrap">
          <div className="subpage-grid-2">
            <div className="subpage-body">
              <p className="subpage-intro">
                Curae curabitur tincidunt duis et vitae nisi exercitation
                nostrud posuere in aliquip vel eleifend lacus.
              </p>
              <p>
                Reprehenderit feugiat ipsum officia deserunt nibh fermentum anim
                esse sint adipiscing quis, qui dolor velit. Aute culpa ut
                commodo elit tempor quam, ullamco fugiat irure ultrices
                incididunt.
              </p>
              <p>
                Arcu integer mollit odio a veniam pariatur occaecat cubilia
                praesent suscipit ex odio. Consectetur quis praesent nostrud
                curabitur ea aliqua tempor voluptate.
              </p>
            </div>
            <div
              className="subpage-body"
              style={{
                background: "var(--white)",
                border: "1px solid rgba(126, 21, 24, 0.12)",
                padding: 40,
              }}
            >
              <h3 style={{ color: "var(--burgundy)", marginTop: 0 }}>
                Quick Facts
              </h3>
              <ul className="premium-list" style={{ margin: "20px 0 0" }}>
                <li className="premium-list-item">
                  <div className="premium-list-title">Student-Teacher Ratio</div>
                  <p style={{ fontSize: 14, margin: 0 }}>
                    Anim pretium proident lacus pariatur tincidunt.
                  </p>
                </li>
                <li className="premium-list-item">
                  <div className="premium-list-title">Dual Pathways</div>
                  <p style={{ fontSize: 14, margin: 0 }}>
                    Labore vel curae enim excepteur.
                  </p>
                </li>
                <li className="premium-list-item">
                  <div className="premium-list-title">Bilingual Instruction</div>
                  <p style={{ fontSize: 14, margin: 0 }}>
                    Orci cillum amet dolore primis sunt luctus.
                  </p>
                </li>
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
            Vision & Mission
          </h2>
          <div className="mws-card-grid">
            <div className="mws-dark-card">
              <h3>Our Vision</h3>
              <p>
                "Fermentum arcu veniam do occaecat irure minim esse, ex
                reprehenderit eiusmod mollit ante non nulla. Exercitation qui
                laborum ultrices ut gravida laboris."
              </p>
            </div>
            <div className="mws-dark-card">
              <h3>Our Mission</h3>
              <ul className="premium-list" style={{ margin: 0 }}>
                <li className="premium-list-item">
                  <p>
                    <strong>Feugiat duis:</strong> Nisi vitae suscipit et fugiat
                    consequat aute magna nulla.
                  </p>
                </li>
                <li className="premium-list-item">
                  <p>
                    <strong>Lorem cupidatat:</strong> Integer est ipsum
                    adipiscing elit deserunt culpa velit.
                  </p>
                </li>
                <li className="premium-list-item">
                  <p>
                    <strong>Ullamco commodo eleifend:</strong> Vestibulum nibh
                    augue quam dolor cubilia aliquip sed sit.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="subpage-section">
        <div className="wrap">
          <h2 style={{ marginBottom: 60, textAlign: "center" }}>MWS Core Values</h2>
          <div className="mws-value-grid">
            {values.map(([title, text]) => (
              <article className="mws-value-card" key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
