import { Link } from "react-router-dom";
import SubpageHero from "../../components/ui/SubpageHero";
import { asset, newsPosts } from "../../data/site";

export default function NewsDetail() {
  return (
    <main>
      <SubpageHero
        title="STEAM Exhibition 2026"
        image={asset("_DSC4760.jpg")}
        imageAlt="STEAM Exhibition Event"
        breadcrumbs={[
          { label: "Home", path: "/" },
          { label: "School News", path: "/news" },
          { label: "Article Detail" },
        ]}
      />

      <section className="subpage-section">
        <div className="wrap">
          <div className="subpage-grid-2">
            <article className="subpage-body">
              <span className="article-badge">Student Life</span>
              <span className="article-meta">
                Published on October 16, 2026 - Written by MWS Editorial Team
              </span>

              <p className="subpage-intro">
                Culpa curabitur fugiat luctus nulla nostrud nulla ex lacus
                veniam. Sunt orci vestibulum arcu quis duis, labore aute nisi
                quam fermentum nibh suscipit.
              </p>

              <p>
                Enim ullamco vel curae id ante, magna cubilia aliqua pretium
                est. Consectetur officia incididunt ultrices eiusmod dolore
                pariatur in esse dolor proident anim irure integer tincidunt.
              </p>

              <blockquote className="article-quote">
                "Lorem quis a occaecat eiusmod, cupidatat pariatur et
                reprehenderit orci. Integer exercitation do irure officia,
                suscipit laborum elit nostrud ullamco."
                <span>Praesent pretium odio posuere primis aute.</span>
              </blockquote>

              <p>
                Enim augue lorem culpa cillum mollit fugiat laboris, deserunt ad
                arcu. Ante eu nibh, aliqua nulla nisi sed ipsum quam gravida
                commodo aliquip.
              </p>

              <div className="article-image">
                <img src={asset("_DSC7101.jpg")} alt="Students demonstrating solar cell projects" />
                <p>Dolore labore faucibus, id non sint ea ut consequat.</p>
              </div>

              <p>
                Sunt lacus cubilia, dolor tempor luctus velit est eiusmod
                proident amet. Consequat orci sint cupidatat a incididunt eu
                pariatur ipsum eleifend quis feugiat.
              </p>

              <p>
                Voluptate fugiat deserunt dolore reprehenderit pretium et,
                aliquip vel aute id faucibus cillum minim. Ea elit aliqua ante
                ullamco labore irure curabitur laboris.
              </p>
            </article>

            <aside className="subpage-body">
              <div className="article-sidebar-card">
                <h3>More News</h3>
                <ul className="premium-list" style={{ gap: 24, margin: 0 }}>
                  {newsPosts.map((post, index) => (
                    <li
                      key={post.title}
                      style={{
                        borderTop: index === 0 ? undefined : "1px solid var(--border)",
                        paddingTop: index === 0 ? undefined : 18,
                      }}
                    >
                      <Link className="article-sidebar-link" to="/news/detail">
                        {post.title}
                      </Link>
                      <span style={{ color: "var(--charcoal-muted)", fontSize: 12 }}>
                        {post.date}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="article-visit-card">
                <h3>Visit Our Campus</h3>
                <p>
                  Nostrud vitae nulla, lorem occaecat labore est amet.
                  Vestibulum ante pretium excepteur lorem sit do.
                </p>
                <Link className="btn-visit" to="/admission">
                  Book a Tour
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
