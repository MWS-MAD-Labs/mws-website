import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { academicLinks, logoUrl, pageLinks } from "../../data/site";

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

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

  const headerClassName = cx(
    "fixed inset-x-0 top-0 z-[60] bg-transparent transition-[background,transform,box-shadow] duration-[350ms] ease-in-out max-[980px]:overflow-visible",

    isScrolled &&
      "bg-white shadow-[0_12px_30px_rgba(36,34,34,0.08)] max-[980px]:bg-[var(--burgundy)] max-[980px]:shadow-[0_10px_26px_rgba(36,23,24,0.18)]",

    isHidden && !isOpen && "-translate-y-[120%]",

    isOpen &&
      "max-[980px]:translate-y-0 max-[980px]:bg-[var(--burgundy)] max-[980px]:shadow-[0_10px_26px_rgba(36,23,24,0.18)]",
  );
  const topNavClassName = ({ isActive }: { isActive: boolean }) =>
    cx(
      "relative pb-1 font-[var(--f-head)] text-[14.5px] font-medium text-[rgba(248,247,243,0.92)] transition-colors duration-[400ms] after:absolute after:bottom-0 after:left-0 after:h-px after:bg-[var(--gold)] after:transition-[width] after:duration-300 after:content-[''] hover:after:w-full max-[980px]:flex max-[980px]:min-h-10 max-[980px]:w-full max-[980px]:items-center max-[980px]:justify-start max-[980px]:rounded-md max-[980px]:px-2.5 max-[980px]:py-[9px] max-[980px]:text-[13px] max-[980px]:leading-tight max-[980px]:text-white/90 max-[980px]:after:hidden max-[980px]:hover:bg-white/10 max-[980px]:hover:text-white max-[680px]:text-xs",
      isScrolled && "text-[var(--charcoal)] after:bg-[var(--burgundy)]",
      isActive
        ? "text-[var(--gold)] opacity-100 after:w-full max-[980px]:bg-white/10 max-[980px]:text-white"
        : "opacity-[0.78] after:w-0",
      isActive && isScrolled && "text-[var(--burgundy)]",
    );

  const dropdownLinkClassName = ({ isActive }: { isActive: boolean }) =>
    cx(
      "block whitespace-nowrap px-3 py-2.5 text-[13.5px] leading-tight text-[var(--charcoal)] transition-colors duration-[250ms] after:hidden hover:bg-[rgba(184,154,104,0.16)] hover:text-[var(--burgundy)] max-[980px]:min-h-[34px] max-[980px]:whitespace-normal max-[980px]:rounded-md max-[980px]:px-2.5 max-[980px]:py-2 max-[980px]:text-[12.5px] max-[980px]:text-white/80 max-[980px]:hover:bg-white/10 max-[980px]:hover:text-white",
      isActive
        ? "bg-[rgba(126,21,24,0.08)] text-[var(--burgundy)] opacity-100 max-[980px]:bg-white/10 max-[980px]:text-white"
        : "opacity-[0.72]",
    );

  const dropdownItemClassName = (isActive: boolean, menu: string) =>
    cx(
      "group/dropdown relative max-[980px]:grid max-[980px]:grid-cols-[1fr_38px] max-[980px]:items-start",
      isActive &&
        (isScrolled
          ? "[&>a]:text-[var(--burgundy)] [&>a]:after:w-full max-[980px]:[&>a]:text-white"
          : "[&>a]:text-[var(--gold)] [&>a]:after:w-full max-[980px]:[&>a]:text-white"),
      openMenu === menu &&
        "max-[980px]:[&>button>span]:translate-y-0 max-[980px]:[&>button>span]:rotate-[225deg]",
    );

  const dropdownMenuClassName = (menu: string, isAcademic = false) =>
    cx(
      "invisible absolute left-[-18px] top-[calc(100%+14px)] z-[80] flex min-w-[220px] translate-y-2.5 flex-col gap-0 border border-[rgba(86,28,34,0.1)] bg-[rgba(248,247,243,0.96)] p-2.5 opacity-0 shadow-[0_18px_42px_rgba(25,24,23,0.16)] transition-[opacity,transform,visibility] duration-200 before:absolute before:-top-4 before:left-0 before:right-0 before:h-4 before:content-[''] group-hover/dropdown:visible group-hover/dropdown:translate-y-0 group-hover/dropdown:opacity-100 group-focus-within/dropdown:visible group-focus-within/dropdown:translate-y-0 group-focus-within/dropdown:opacity-100 max-[980px]:static max-[980px]:col-span-full max-[980px]:m-0 max-[980px]:min-w-0 max-[980px]:translate-y-0 max-[980px]:border-0 max-[980px]:border-l max-[980px]:border-white/20 max-[980px]:bg-transparent max-[980px]:p-0 max-[980px]:pl-2.5 max-[980px]:shadow-none max-[980px]:opacity-100 max-[980px]:before:hidden",
      isAcademic && "min-w-[300px]",
      openMenu === menu
        ? "max-[980px]:grid max-[980px]:visible max-[980px]:pointer-events-auto"
        : "max-[980px]:hidden max-[980px]:pointer-events-none",
    );

  const toggleMenu = (menu: string) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const closeNav = () => {
    setIsOpen(false);
    setOpenMenu(null);
  };

  return (
    <header className={headerClassName} data-header>
      <div
        className={cx(
          "relative flex w-full items-center justify-between px-10 py-7 transition-[padding] duration-[350ms] ease-in-out max-[1180px]:px-7 max-[980px]:min-h-16 max-[980px]:gap-3 max-[980px]:px-4 max-[980px]:py-2 max-[560px]:min-h-[62px] max-[560px]:px-3",
          isScrolled &&
            "px-12 py-[18px] max-[1180px]:px-7 max-[980px]:px-4 max-[980px]:py-2",
        )}
      >
        <div className="flex min-w-[140px] items-center justify-start transition-opacity duration-300 max-[980px]:min-w-0">
          <Link to="/#hero" aria-label="Millennia World School home">
            <img
              className="block h-[66px] w-[66px] object-contain drop-shadow-[0_6px_12px_rgba(36,23,24,0.18)] max-[980px]:h-[46px] max-[980px]:w-[46px] max-[560px]:h-[42px] max-[560px]:w-[42px]"
              src={logoUrl}
              alt="MWS Logo"
            />
          </Link>
        </div>

        <button
          className="ml-auto hidden h-[42px] w-[42px] cursor-pointer place-items-center rounded-lg border border-white/30 bg-white/10 text-white max-[980px]:grid max-[560px]:h-10 max-[560px]:w-10"
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={isOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsOpen((value) => !value)}
        >
          <span
            className={cx(
              "my-0.5 block h-0.5 w-5 rounded-full bg-current transition-[opacity,transform] duration-200",
              isOpen && "translate-y-1.5 rotate-45",
            )}
          />
          <span
            className={cx(
              "my-0.5 block h-0.5 w-5 rounded-full bg-current transition-[opacity,transform] duration-200",
              isOpen && "opacity-0",
            )}
          />
          <span
            className={cx(
              "my-0.5 block h-0.5 w-5 rounded-full bg-current transition-[opacity,transform] duration-200",
              isOpen && "-translate-y-1.5 -rotate-45",
            )}
          />
        </button>

        <div
          className={cx(
            "ml-auto flex items-center gap-[30px] max-[1180px]:gap-[18px] max-[980px]:absolute max-[980px]:left-3 max-[980px]:right-3 max-[980px]:top-full max-[980px]:z-[120] max-[980px]:m-0 max-[980px]:max-h-[calc(100dvh-78px)] max-[980px]:w-auto max-[980px]:overflow-y-auto max-[980px]:overflow-x-hidden max-[980px]:rounded-lg max-[980px]:border max-[980px]:border-white/20 max-[980px]:bg-[var(--burgundy)] max-[980px]:p-2.5 max-[980px]:shadow-[0_18px_38px_rgba(36,23,24,0.26)] max-[560px]:left-2 max-[560px]:right-2 max-[560px]:max-h-[calc(100dvh-70px)] max-[560px]:p-2",
            isOpen ? "max-[980px]:block" : "max-[980px]:hidden",
          )}
          onClick={(event) => {
            const target = event.target;
            if (target instanceof Element && target.closest("a")) {
              closeNav();
            }
          }}
        >
          <nav
            className="flex items-center max-[980px]:block"
            id="primary-navigation"
            aria-label="Main navigation"
          >
            <ul className="flex list-none items-center gap-[30px] max-[1180px]:gap-5 max-[980px]:grid max-[980px]:w-full max-[980px]:gap-0.5">
              <li className={dropdownItemClassName(pathname === "/", "home")}>
                <NavLink to="/#hero" className={topNavClassName}>
                  Home
                </NavLink>
                <button
                  className="hidden h-10 w-[38px] place-items-center rounded-md border-0 bg-transparent text-white/90 max-[980px]:grid"
                  type="button"
                  aria-label="Open home menu"
                  aria-expanded={openMenu === "home"}
                  onClick={() => toggleMenu("home")}
                >
                  <span className="h-[9px] w-[9px] translate-y-[-2px] rotate-45 border-b-2 border-r-2 border-current transition-transform duration-200" />
                </button>
                <ul className={dropdownMenuClassName("home")}>
                  <li>
                    <Link
                      className={dropdownLinkClassName({ isActive: false })}
                      to="/#campus-spotlight"
                    >
                      Facilities
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={dropdownLinkClassName({ isActive: false })}
                      to="/#philosophy"
                    >
                      About MWS
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={dropdownLinkClassName({
                        isActive: pathname === "/news",
                      })}
                      to="/news"
                    >
                      School News
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={dropdownLinkClassName({ isActive: false })}
                      to="/#community-voices"
                    >
                      School Video
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={dropdownLinkClassName({ isActive: false })}
                      to="/#info-section"
                    >
                      Upcoming Events
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={dropdownLinkClassName({ isActive: false })}
                      to="/#info-section"
                    >
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={dropdownLinkClassName({ isActive: false })}
                      to="/#affiliations"
                    >
                      Affiliations
                    </Link>
                  </li>
                  <li>
                    <Link
                      className={dropdownLinkClassName({ isActive: false })}
                      to="/#philosophy"
                    >
                      Mission Statement
                    </Link>
                  </li>
                </ul>
              </li>

              <li className={dropdownItemClassName(isPagesActive, "pages")}>
                <NavLink to="/our-school" className={topNavClassName}>
                  Pages
                </NavLink>
                <button
                  className="hidden h-10 w-[38px] place-items-center rounded-md border-0 bg-transparent text-white/90 max-[980px]:grid"
                  type="button"
                  aria-label="Open pages menu"
                  aria-expanded={openMenu === "pages"}
                  onClick={() => toggleMenu("pages")}
                >
                  <span className="h-[9px] w-[9px] translate-y-[-2px] rotate-45 border-b-2 border-r-2 border-current transition-transform duration-200" />
                </button>
                <ul className={dropdownMenuClassName("pages")}>
                  {pageLinks.map((item) => (
                    <li key={item.path}>
                      <NavLink to={item.path} className={dropdownLinkClassName}>
                        {item.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>

              <li
                className={dropdownItemClassName(isAcademicActive, "academics")}
              >
                <NavLink to="/academic" className={topNavClassName}>
                  Academics
                </NavLink>
                <button
                  className="hidden h-10 w-[38px] place-items-center rounded-md border-0 bg-transparent text-white/90 max-[980px]:grid"
                  type="button"
                  aria-label="Open academics menu"
                  aria-expanded={openMenu === "academics"}
                  onClick={() => toggleMenu("academics")}
                >
                  <span className="h-[9px] w-[9px] translate-y-[-2px] rotate-45 border-b-2 border-r-2 border-current transition-transform duration-200" />
                </button>
                <ul className={dropdownMenuClassName("academics", true)}>
                  {academicLinks.map((item) => (
                    <li key={item.path}>
                      <NavLink to={item.path} className={dropdownLinkClassName}>
                        {item.label}
                        <span className="mt-1 block whitespace-normal font-[var(--f-body)] text-[11px] font-medium leading-[1.35] text-[var(--charcoal-muted)] max-[980px]:text-white/70">
                          {item.description}
                        </span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>

              <li>
                <NavLink to="/school-calendar" className={topNavClassName}>
                  School Calendar
                </NavLink>
              </li>
              <li>
                <NavLink to="/news" className={topNavClassName}>
                  News
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className={topNavClassName}>
                  Contact
                </NavLink>
              </li>
            </ul>
          </nav>
          <Link
            className={cx(
              "border px-[22px] py-2.5 font-[var(--f-head)] text-sm font-semibold transition-[background,color,border-color] duration-300 hover:border-[var(--burgundy-dark)] hover:bg-[var(--burgundy-dark)] hover:text-white max-[980px]:mt-2 max-[980px]:flex max-[980px]:min-h-11 max-[980px]:w-full max-[980px]:items-center max-[980px]:justify-center max-[980px]:rounded-lg max-[980px]:border-white/70 max-[980px]:bg-white max-[980px]:px-4 max-[980px]:py-[11px] max-[980px]:text-center max-[980px]:text-[0.88rem] max-[980px]:font-extrabold max-[980px]:leading-tight max-[980px]:text-[var(--burgundy)]",
              isScrolled
                ? "border-[var(--burgundy)] text-[var(--burgundy)]"
                : "border-[rgba(248,247,243,0.7)] text-white",
            )}
            to="/admission"
          >
            Book a Tour
          </Link>
        </div>
      </div>
    </header>
  );
}
