import { Link } from "react-router-dom";
import { programCards } from "../../data/site";

export default function ProgramCards() {
  return (
    <section className="classes-section" id="academic-programs" aria-labelledby="classes-title">
      <div className="section-shell">
        <div className="section-heading motion-fade-up">
          <h2 id="classes-title">Programs for every learning stage</h2>
        </div>
        <div className="class-grid">
          {programCards.map((program, index) => (
            <article
              key={program.id}
              className={`class-card motion-fade-up ${
                index === 1 ? "motion-delay-100" : ""
              } ${index === 2 ? "motion-delay-200" : ""} motion-hover-lift`}
              id={program.id}
            >
              <div className="media-placeholder class-photo">
                <img src={program.image} alt={program.title} />
              </div>
              <div className="class-card-body">
                <h3>{program.title}</h3>
                <span>{program.age}</span>
                <p>{program.text}</p>
                <Link className="text-link" to={program.path}>
                  Learn More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
