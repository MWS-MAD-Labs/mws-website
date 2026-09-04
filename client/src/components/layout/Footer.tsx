import { Link } from "react-router-dom";
import { logoUrl } from "../../data/site";

export default function Footer() {
  return (
    <footer className="site-footer" id="contact" data-footer>
      <div className="wrap">
        <div className="footer-top footer-grid">
          <div className="footer-brand">
            <Link
              className="footer-logo"
              to="/#hero"
              aria-label="Millennia World School home"
            >
              <img src={logoUrl} alt="Millennia World School" />
            </Link>
            <p>
              Adipiscing sed voluptate, praesent posuere sunt primis
              reprehenderit ex consectetur est quis. Anim faucibus nulla veniam.
            </p>
          </div>

          <div className="footer-links">
            <h2>Explore</h2>
            <Link to="/our-school">About us</Link>
            <Link to="/academic">Academics</Link>
            <Link to="/#campus-spotlight">Campus environment</Link>
            <Link to="/community-stories">Community stories</Link>
          </div>

          <div className="footer-links">
            <h2>Programs</h2>
            <Link to="/academic/kindergarten">Kindergarten</Link>
            <Link to="/academic/elementary">Elementary</Link>
            <Link to="/academic/high-school">High School</Link>
            <Link to="/kurikulum">Curriculum</Link>
          </div>

          <div className="footer-contact">
            <h2>Contact</h2>
            <p>
              Jl. Merpati Raya No. 103
              <br />
              Sawah Lama, Ciputat, Tangerang Selatan, Banten 15413
            </p>
            <a href="mailto:info@millennia21.id">info@millennia21.id</a>
            <Link to="/admission" className="footer-cta">
              Book a Tour
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Millennia World School. All rights reserved.</p>
          <div>
            <Link to="/#hero">Back to top</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
