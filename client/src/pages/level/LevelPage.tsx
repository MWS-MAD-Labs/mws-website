import { Link } from "react-router-dom";
import SubpageHero from "../../components/ui/SubpageHero";

type TableRow = [string, string, string];

type Activity = {
  title: string;
  image: string;
};

type LevelPageProps = {
  title: string;
  heroImage: string;
  intro: string;
  ageRange: string;
  focus: string;
  tableRows: TableRow[];
  activities: Activity[];
};

export default function LevelPage({
  title,
  heroImage,
  intro,
  ageRange,
  focus,
  tableRows,
  activities,
}: LevelPageProps) {
  return (
    <main>
      <SubpageHero
        title={title}
        image={heroImage}
        imageAlt={`${title} at MWS`}
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "Academics", path: "/academic" },
          { label: title },
        ]}
      />

      <section className="subpage-section">
        <div className="wrap">
          <div className="subpage-grid-2">
            <div className="subpage-body">
              <p className="subpage-intro">{intro}</p>
              <h2>{title} Learning Experience</h2>
              <p>
                Labore luctus occaecat cillum tincidunt laborum, quam gravida
                eleifend proident mollit orci voluptate. Students learn through
                carefully paced routines, meaningful inquiry, and warm guidance.
              </p>
              <ul className="premium-list">
                <li className="premium-list-item">
                  <div className="premium-list-title">Age Range</div>
                  <p>{ageRange}</p>
                </li>
                <li className="premium-list-item">
                  <div className="premium-list-title">Program Focus</div>
                  <p>{focus}</p>
                </li>
                <li className="premium-list-item">
                  <div className="premium-list-title">Family Partnership</div>
                  <p>
                    Teachers document progress and keep parents close to the
                    rhythm of classroom learning.
                  </p>
                </li>
              </ul>
            </div>

            <div>
              <div className="premium-table-wrapper">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th>Area</th>
                      <th>Learning Focus</th>
                      <th>Experience</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map(([area, learningFocus, experience]) => (
                      <tr key={area}>
                        <td>{area}</td>
                        <td>{learningFocus}</td>
                        <td>{experience}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Link className="btn-submit" to="/admission">
                Book a Tour
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="program-activity-section">
        <div className="wrap">
          <div className="program-activity-head">
            <h2 id={`${title.toLowerCase().replaceAll(" ", "-")}-activity-title`}>
              A day shaped around purposeful learning.
            </h2>
            <p>
              Eiusmod proident laborum curae nulla vestibulum gravida amet
              praesent, do dolor eleifend mollit.
            </p>
          </div>
          <div className="program-activity-grid">
            {activities.map((activity) => (
              <article className="program-activity-card" key={activity.title}>
                <img src={activity.image} alt={activity.title} />
                <h3>{activity.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
