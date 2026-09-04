import { Link } from "react-router-dom";
import SubpageHero from "../../components/ui/SubpageHero";
import { asset, newsPosts } from "../../data/site";

export default function SchoolNews() {
  return (
    <main>
      <SubpageHero
        title="School News"
        image={asset("DSC04079.jpg")}
        imageAlt="MWS School Activities"
        breadcrumbs={[{ label: "Home", path: "/" }, { label: "School News" }]}
      />

      <section className="news-page-section" aria-label="School news post feed">
        <div className="wrap">
          <div className="news-layout">
            <section className="news-feed">
              {newsPosts.map((post, index) => (
                <article
                  className={`news-post-card motion-fade-up ${
                    index === 1 ? "motion-delay-100" : ""
                  } ${index === 2 ? "motion-delay-200" : ""} motion-hover-lift`}
                  key={post.title}
                >
                  <div className="news-post-media">
                    <img src={post.image} alt={post.title} />
                  </div>
                  <div className="news-post-body">
                    <div className="news-post-meta">
                      <span className={`news-badge ${post.badgeClass}`}>
                        {post.category}
                      </span>
                      <span>{post.date}</span>
                      <span>
                        by <strong>{post.author}</strong>
                      </span>
                    </div>
                    <h2>
                      <Link to="/news/detail">{post.title}</Link>
                    </h2>
                    <p>{post.text}</p>
                    <div className="news-post-footer">
                      <Link className="text-link" to="/news/detail">
                        Read Story
                      </Link>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="news-sidebar">
              <div className="news-widget">
                <form
                  className="news-search"
                  action="#"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <input type="text" placeholder="Search stories..." aria-label="Search news" />
                  <button type="submit">Search</button>
                </form>
              </div>

              <div className="news-widget">
                <h2>Categories</h2>
                <ul className="news-widget-list">
                  <li>
                    <a href="#academics">Academics <span>8</span></a>
                  </li>
                  <li>
                    <a href="#student-life">Student Life <span>12</span></a>
                  </li>
                  <li>
                    <a href="#events">School Events <span>5</span></a>
                  </li>
                  <li>
                    <a href="#milestones">Milestones <span>3</span></a>
                  </li>
                </ul>
              </div>

              <div className="news-widget news-widget-dark">
                <h2>Schedule Highlights</h2>
                <div className="news-schedule-item">
                  <strong>Parent Coffee Morning</strong>
                  <span>Tuesday - 09:00 AM</span>
                </div>
                <div className="news-schedule-item">
                  <strong>Student Exhibition</strong>
                  <span>Friday - Main Hall</span>
                </div>
              </div>

              <div className="news-widget">
                <h2>Recent Updates</h2>
                <ul className="news-recent-list">
                  {newsPosts.map((post) => (
                    <li key={post.title}>
                      <Link to="/news/detail">{post.title}</Link>
                      <span>{post.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
