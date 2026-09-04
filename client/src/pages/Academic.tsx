import { Link } from "react-router-dom";
import ProgramCards from "../components/ui/ProgramCards";
import SubpageHero from "../components/ui/SubpageHero";
import { asset } from "../data/site";

const pillars = [
  ["Learning Design", "Inquiry blocks, guided workshops, and studio time."],
  ["Assessment", "Frequent feedback that helps students understand their next step."],
  ["Academic Support", "Small group guidance for language, numeracy, and confidence."],
  ["Student Development", "Leadership, wellbeing, service, and social-emotional learning."],
  ["Pathways", "A coherent journey from early years through secondary readiness."],
  ["Community", "Parents, teachers, and students working from one shared language."],
];

export default function Academic() {
  return (
    <main>
      <SubpageHero
        title="Academics"
        image={asset("DSC09500.jpg")}
        imageAlt="MWS academic learning spaces"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "Academics" }]}
      />

      <section className="subpage-section" id="academic-overview">
        <div className="wrap">
          <div className="subpage-grid-2">
            <div className="subpage-body">
              <p className="subpage-intro">
                A connected academic pathway that helps learners build strong
                foundations, discover interests, and practice responsible
                independence.
              </p>
              <h2>Learning That Grows With Each Child</h2>
              <p>
                Aliquip irure proident laborum curae nulla vestibulum gravida
                amet praesent. Students move through routines that balance
                explicit teaching, inquiry, collaboration, reflection, and
                meaningful application.
              </p>
              <p>
                The academic program is ready for future CMS-backed content:
                program details, calendars, and curriculum notes are kept as
                structured page data rather than hidden inside layout code.
              </p>
              <div style={{ display: "flex", gap: 14, marginTop: 30 }}>
                <Link className="btn-submit" style={{ width: "auto" }} to="/kurikulum">
                  View Curriculum
                </Link>
                <Link className="btn-submit" style={{ width: "auto" }} to="/school-calendar">
                  School Calendar
                </Link>
              </div>
            </div>
            <div className="subpage-body">
              <h2>Academic Rhythm</h2>
              <ul className="premium-list">
                <li className="premium-list-item">
                  <div className="premium-list-title">Inquiry and Foundations</div>
                  <p>Lessons invite curiosity while keeping essential skills visible.</p>
                </li>
                <li className="premium-list-item">
                  <div className="premium-list-title">Documentation</div>
                  <p>Teachers collect learning evidence and share progress clearly.</p>
                </li>
                <li className="premium-list-item">
                  <div className="premium-list-title">Community Context</div>
                  <p>Projects connect classroom learning with life beyond campus.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ProgramCards />

      <section className="subpage-section" id="academic-ecosystem">
        <div className="wrap">
          <div className="acad-pillar-grid">
            {pillars.map(([title, text], index) => (
              <article
                key={title}
                className={`acad-pillar ${
                  ["ac-navy", "ac-navy", "ac-sage", "ac-gold", "ac-rose", "ac-burgundy"][
                    index
                  ]
                }`}
              >
                <span className="acad-pillar-tag">0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="subpage-section">
        <div className="wrap">
          <div className="acad-pathway">
            <div className="acad-pathway-item">
              <span className="acad-pathway-accent" />
              <h3>Kindergarten</h3>
              <p className="acad-pathway-age">Age 2 - 6</p>
              <Link className="text-link" to="/academic/kindergarten">
                Learn More
              </Link>
            </div>
            <div className="acad-pathway-item">
              <span className="acad-pathway-accent" />
              <h3>Elementary</h3>
              <p className="acad-pathway-age">Age 6 - 12</p>
              <Link className="text-link" to="/academic/elementary">
                Learn More
              </Link>
            </div>
            <div className="acad-pathway-item">
              <span className="acad-pathway-accent" />
              <h3>High School</h3>
              <p className="acad-pathway-age">Age 12 - 15</p>
              <Link className="text-link" to="/academic/high-school">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
