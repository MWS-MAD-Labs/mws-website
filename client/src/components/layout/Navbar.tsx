import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { academicLinks, logoUrl, pageLinks } from "../../data/site";

export default function Navbar() {
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const syncHeader = () => {
      const currentY = window.scrollY;
      setIsScrolled(currentY > 24);
      setIsHidden(currentY > lastScrollY && currentY > 80 && !isOpen);

      if (currentY <= 24) {
        setIsHidden(false);
      }

      lastScrollY = currentY;
    };

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
    return () => window.removeEventListener("scroll", syncHeader);
  }, [isOpen]);

  const isPagesActive = pageLinks.some((item) => pathname === item.path);
  const isAcademicActive =
    pathname === "/academic" ||
    academicLinks.some((item) => pathname === item.path);

  const headerClassName = [
    "site-header",
    isScrolled ? "is-scrolled" : "",
    isHidden ? "is-hidden" : "",
    isOpen ? "nav-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const navClassName = ({ isActive }: { isActive: boolean }) =>
    isActive ? "active" : "in-active";

  const toggleMenu = (menu: string) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const closeNav = () => {
    setIsOpen(false);
    setOpenMenu(null);
  };

  return (
    <header className={headerClassName} data-header>
      <div className="nav-inner">
        <div className="logo">
          <Link to="/#hero" aria-label="Millennia World School home">
            <img src={logoUrl} alt="MWS Logo" />
          </Link>
        </div>

        <button
          className="nav-toggle"
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        <div
          className="nav-links"
          onClick={(event) => {
            const target = event.target;
            if (target instanceof Element && target.closest("a")) {
              closeNav();
            }
          }}
        >
          <nav
            className="navbar"
            id="primary-navigation"
            aria-label="Main navigation"
          >
            <ul className="nav-menu">
              <li
                className={`dropdown ${pathname === "/" ? "active" : ""} ${
                  openMenu === "home" ? "is-open" : ""
                }`}
              >
                <NavLink to="/#hero" className={navClassName}>
                  Home
                </NavLink>
                <button
                  className="dropdown-trigger"
                  type="button"
                  aria-label="Open home menu"
                  aria-expanded={openMenu === "home"}
                  onClick={() => toggleMenu("home")}
                >
                  <span />
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <Link to="/#campus-spotlight">Facilities</Link>
                  </li>
                  <li>
                    <Link to="/#philosophy">About MWS</Link>
                  </li>
                  <li>
                    <Link to="/news">School News</Link>
                  </li>
                  <li>
                    <Link to="/#community-voices">School Video</Link>
                  </li>
                  <li>
                    <Link to="/#info-section">Upcoming Events</Link>
                  </li>
                  <li>
                    <Link to="/#info-section">FAQ</Link>
                  </li>
                  <li>
                    <Link to="/#affiliations">Affiliations</Link>
                  </li>
                  <li>
                    <Link to="/#philosophy">Mission Statement</Link>
                  </li>
                </ul>
              </li>

              <li
                className={`dropdown ${isPagesActive ? "active" : ""} ${
                  openMenu === "pages" ? "is-open" : ""
                }`}
              >
                <NavLink to="/our-school" className={navClassName}>
                  Pages
                </NavLink>
                <button
                  className="dropdown-trigger"
                  type="button"
                  aria-label="Open pages menu"
                  aria-expanded={openMenu === "pages"}
                  onClick={() => toggleMenu("pages")}
                >
                  <span />
                </button>
                <ul className="dropdown-menu">
                  {pageLinks.map((item) => (
                    <li key={item.path}>
                      <NavLink to={item.path} className={navClassName}>
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>

              <li
                className={`dropdown ${isAcademicActive ? "active" : ""} ${
                  openMenu === "academics" ? "is-open" : ""
                }`}
              >
                <NavLink to="/academic" className={navClassName}>
                  Academics
                </NavLink>
                <button
                  className="dropdown-trigger"
                  type="button"
                  aria-label="Open academics menu"
                  aria-expanded={openMenu === "academics"}
                  onClick={() => toggleMenu("academics")}
                >
                  <span />
                </button>
                <ul className="dropdown-menu academic-menu">
                  {academicLinks.slice(0, 3).map((item) => (
                    <li key={item.path}>
                      <NavLink to={item.path} className={navClassName}>
                        {item.label}
                        <span>{item.description}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>

              <li>
                <NavLink to="/school-calendar" className={navClassName}>
                  School Calendar
                </NavLink>
              </li>
              <li>
                <NavLink to="/news" className={navClassName}>
                  News
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className={navClassName}>
                  Contact
                </NavLink>
              </li>
            </ul>
          </nav>
          <Link className="btn-visit" to="/admission">
            Book a Tour
          </Link>
        </div>
      </div>
    </header>
  );
}
