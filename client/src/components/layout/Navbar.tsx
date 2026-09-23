import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { academicLinks, logoUrl, pageLinks } from '../../data/site';

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

type MenuKey = 'home' | 'pages' | 'academics';

export default function Navbar() {
  const { pathname } = useLocation();

  const [isHidden, setIsHidden] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const syncHeader = () => {
      const currentY = window.scrollY;

      if (currentY <= 24) {
        setIsHidden(false);
      } else if (currentY > lastScrollY && currentY > 80) {
        setIsHidden(true);
      } else if (currentY < lastScrollY) {
        setIsHidden(false);
      }

      lastScrollY = currentY;
    };

    window.addEventListener('scroll', syncHeader, { passive: true });

    return () => {
      window.removeEventListener('scroll', syncHeader);
    };
  }, []);

  const isPagesActive = pageLinks.some((item) => pathname === item.path);

  const isAcademicActive =
    pathname === '/academic' || academicLinks.some((item) => pathname === item.path);

  const headerClassName = cx(
    'fixed left-0 top-0 z-[60] w-full bg-white shadow-[0_8px_24px_rgba(36,23,24,0.07)] transition-transform duration-[350ms] ease-in-out',
    isHidden && !isOpen && '-translate-y-full',
  );

  const topNavClassName = ({ isActive }: { isActive: boolean }) =>
    cx(
      'relative flex items-center font-[var(--f-head)] text-[14.5px] font-medium text-[var(--charcoal)] transition-colors duration-300',
      'after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-[var(--burgundy)] after:transition-[width] after:duration-300 after:content-[""]',
      'hover:text-[var(--burgundy)] hover:after:w-full',
      isActive ? 'font-semibold text-[var(--burgundy)] after:w-full' : 'opacity-80',
      'max-[980px]:min-h-10 max-[980px]:w-full max-[980px]:rounded-md max-[980px]:px-3 max-[980px]:py-2.5 max-[980px]:text-[13px] max-[980px]:leading-tight',
      'max-[980px]:after:hidden max-[980px]:hover:bg-[rgba(126,21,24,0.06)]',
    );

  const dropdownLinkClassName = ({ isActive }: { isActive: boolean }) =>
    cx(
      'relative block py-2.5 pl-4 pr-3 text-[14px] leading-snug',
      'font-[var(--f-head)] text-[var(--charcoal)]',
      'transition-colors duration-200',

      // A hairline rule carries the state instead of a filled block, so hover
      // and active stay quiet next to the rest of the bar.
      'before:absolute before:bottom-1.5 before:left-0 before:top-1.5 before:w-[2px]',
      'before:bg-transparent before:transition-colors before:duration-200 before:content-[""]',
      'hover:text-[var(--burgundy)] hover:before:bg-[rgba(126,21,24,0.3)]',

      isActive && 'font-semibold text-[var(--burgundy)] before:bg-[var(--burgundy)]',

      'max-[980px]:pl-3 max-[980px]:text-[13px]',
    );

  /**
   * The panel is absolute against the header container (the closest positioned
   * ancestor), not against its own `<li>`. `top-full` therefore lands on the
   * bottom edge of the bar on its own, and the panel spans the full width of
   * it, which is what makes it read as the bar continuing rather than a card
   * hovering over the hero.
   */
const dropdownPanelClassName = (menu: MenuKey) =>
  cx(
    'absolute left-1/2 top-full z-[80] -translate-x-1/2',
    'w-max border-t border-[rgba(36,23,24,0.08)] bg-white',
    'shadow-[0_16px_28px_-20px_rgba(36,23,24,0.45)]',
    'invisible translate-y-1 opacity-0',
    'transition-[opacity,transform,visibility] duration-200',
    'group-hover:visible group-hover:translate-y-0 group-hover:opacity-100',
    'group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100',

    menu === 'academics' ? 'min-w-[700px] px-6 py-5' : 'min-w-[560px] px-6 py-5',

    openMenu === menu ? 'max-[980px]:block' : 'max-[980px]:hidden',

    'max-[980px]:static max-[980px]:w-full max-[980px]:min-w-0',
    'max-[980px]:translate-x-0 max-[980px]:translate-y-0',
    'max-[980px]:border-0 max-[980px]:border-l',
    'max-[980px]:border-[rgba(126,21,24,0.15)]',
    'max-[980px]:bg-transparent max-[980px]:px-3 max-[980px]:py-1',
    'max-[980px]:shadow-none',
    'max-[980px]:visible max-[980px]:opacity-100',
  );

  /** Columns sit under the menu itself, so the panel never spreads too wide. */
  const dropdownListClassName = (columns: 2 | 3) =>
    cx(
      'ml-auto grid w-full list-none gap-x-10 gap-y-1',
      columns === 3 ? 'max-w-[780px] grid-cols-3' : 'max-w-[620px] grid-cols-2',
      'max-[980px]:ml-0 max-[980px]:max-w-none max-[980px]:grid-cols-1 max-[980px]:gap-0',
    );

  /**
   * No `relative` here on purpose. The negative margin cancels out the padding,
   * so the item keeps its place in the bar while its box grows to the full
   * height of it — the cursor then reaches the panel without crossing a strip
   * that belongs to nobody and would close the menu on the way down.
   */
  const navItemClassName = (...extra: Array<string | false | null | undefined>) =>
    cx(
      'group relative -my-8 py-8',
      'max-[980px]:my-0 max-[980px]:grid max-[980px]:grid-cols-[minmax(0,1fr)_40px] max-[980px]:py-0',
      ...extra,
    );

  const closeNav = () => {
    setIsOpen(false);
    setOpenMenu(null);
  };

  const toggleMenu = (menu: MenuKey) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const menuButtonClassName = (menu: MenuKey) =>
    cx(
      'hidden h-10 w-10 shrink-0 place-items-center rounded-md border-0 bg-transparent text-[var(--charcoal)]',
      'transition-colors hover:bg-[rgba(126,21,24,0.06)]',
      'max-[980px]:grid',
      openMenu === menu && 'text-[var(--burgundy)]',
    );

  const menuArrowClassName = (menu: MenuKey) =>
    cx(
      'h-2 w-2 translate-y-[-2px] rotate-45 border-b-2 border-r-2 border-current transition-transform duration-200',
      openMenu === menu && 'translate-y-[2px] rotate-[225deg]',
    );

  return (
    <div className="h-[86px] max-[980px]:h-[58px] max-[560px]:h-[54px]">
      <header className={headerClassName} data-header>
        <div
          className={cx(
            'relative flex w-full items-center justify-between px-10 py-4',
            'max-[1180px]:px-7',
            'max-[980px]:min-h-[58px] max-[980px]:gap-3 max-[980px]:px-4 max-[980px]:py-1.5',
            'max-[560px]:min-h-[54px] max-[560px]:px-3',
          )}
        >
          {/* Logo */}
          <div className="flex min-w-[120px] items-center max-[980px]:min-w-0">
            <Link to="/#hero" aria-label="Millennia World School home">
              <img
                className="block h-[54px] w-[54px] object-contain max-[980px]:h-10 max-[980px]:w-10 max-[560px]:h-9 max-[560px]:w-9"
                src={logoUrl}
                alt="MWS Logo"
              />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="ml-auto hidden h-10 w-10 place-items-center rounded-lg border border-[rgba(36,23,24,0.14)] bg-white text-[var(--charcoal)] max-[980px]:grid max-[560px]:h-9 max-[560px]:w-9"
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            aria-controls="primary-navigation"
            onClick={() => setIsOpen((value) => !value)}
          >
            <span
              className={cx(
                'my-0.5 block h-0.5 w-5 rounded-full bg-current transition-[opacity,transform] duration-200',
                isOpen && 'translate-y-1.5 rotate-45',
              )}
            />
            <span
              className={cx(
                'my-0.5 block h-0.5 w-5 rounded-full bg-current transition-opacity duration-200',
                isOpen && 'opacity-0',
              )}
            />
            <span
              className={cx(
                'my-0.5 block h-0.5 w-5 rounded-full bg-current transition-[opacity,transform] duration-200',
                isOpen && '-translate-y-1.5 -rotate-45',
              )}
            />
          </button>

          {/* Navigation */}
          <div
            className={cx(
              'ml-auto flex items-center gap-[30px]',
              'max-[1180px]:gap-5',
              'max-[980px]:absolute max-[980px]:left-3 max-[980px]:right-3 max-[980px]:top-full max-[980px]:z-[120]',
              'max-[980px]:m-0 max-[980px]:max-h-[calc(100dvh-78px)] max-[980px]:overflow-y-auto',
              'max-[980px]:rounded-xl max-[980px]:border max-[980px]:border-[rgba(126,21,24,0.12)]',
              'max-[980px]:bg-white max-[980px]:p-2.5 max-[980px]:shadow-[0_18px_38px_rgba(36,23,24,0.14)]',
              'max-[560px]:left-2 max-[560px]:right-2 max-[560px]:max-h-[calc(100dvh-70px)] max-[560px]:p-2',
              isOpen ? 'max-[980px]:block' : 'max-[980px]:hidden',
            )}
            onClick={(event) => {
              const target = event.target;

              if (target instanceof Element && target.closest('a')) {
                closeNav();
              }
            }}
          >
            <nav
              id="primary-navigation"
              aria-label="Main navigation"
              className="flex items-center max-[980px]:block"
            >
              <ul className="flex list-none items-center gap-[30px] max-[1180px]:gap-5 max-[980px]:grid max-[980px]:w-full max-[980px]:gap-1">
                {/* Home */}
                <li className={navItemClassName()}>
                  <NavLink to="/#hero" className={topNavClassName}>
                    Home
                  </NavLink>

                  <button
                    className={menuButtonClassName('home')}
                    type="button"
                    aria-label="Toggle home menu"
                    aria-expanded={openMenu === 'home'}
                    onClick={() => toggleMenu('home')}
                  >
                    <span className={menuArrowClassName('home')} />
                  </button>

                  <div className={dropdownPanelClassName('home')}>
                    <ul className={dropdownListClassName(2)}>
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
                            isActive: pathname === '/news',
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
                  </div>
                </li>

                {/* Our School */}
                <li
                  className={navItemClassName(
                    isPagesActive && '[&>a]:font-semibold [&>a]:text-[var(--burgundy)]',
                  )}
                >
                  <NavLink to="/our-school" className={topNavClassName}>
                    Our School
                  </NavLink>

                  <button
                    className={menuButtonClassName('pages')}
                    type="button"
                    aria-label="Toggle Our School menu"
                    aria-expanded={openMenu === 'pages'}
                    onClick={() => toggleMenu('pages')}
                  >
                    <span className={menuArrowClassName('pages')} />
                  </button>

                  <div className={dropdownPanelClassName('pages')}>
                    <ul className={dropdownListClassName(2)}>
                      {pageLinks.map((item) => (
                        <li key={item.path}>
                          <NavLink to={item.path} className={dropdownLinkClassName}>
                            <span className="block">{item.label}</span>

                            {item.description && (
                              <span className="mt-1 block text-[11px] leading-[1.45] text-[var(--charcoal-muted)]">
                                {item.description}
                              </span>
                            )}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>

                {/* Academics */}
                <li
                  className={navItemClassName(
                    isAcademicActive && '[&>a]:font-semibold [&>a]:text-[var(--burgundy)]',
                  )}
                >
                  <NavLink to="/academic" className={topNavClassName}>
                    Academics
                  </NavLink>

                  <button
                    className={menuButtonClassName('academics')}
                    type="button"
                    aria-label="Toggle Academics menu"
                    aria-expanded={openMenu === 'academics'}
                    onClick={() => toggleMenu('academics')}
                  >
                    <span className={menuArrowClassName('academics')} />
                  </button>

                  <div className={dropdownPanelClassName('academics')}>
                    <ul className={dropdownListClassName(3)}>
                      {academicLinks.map((item) => (
                        <li key={item.path}>
                          <NavLink to={item.path} className={dropdownLinkClassName}>
                            <span className="block">{item.label}</span>

                            {item.description && (
                              <span className="mt-1.5 block text-[11px] leading-[1.45] text-[var(--charcoal-muted)]">
                                {item.description}
                              </span>
                            )}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>

                {/* Main Links */}
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

            {/* CTA */}
            <Link
              className="border border-[var(--burgundy)] px-[22px] py-2.5 text-sm font-[var(--f-head)] font-semibold text-[var(--burgundy)] transition-[background,color] duration-300 hover:bg-[var(--burgundy)] hover:text-white max-[980px]:mt-2 max-[980px]:flex max-[980px]:min-h-11 max-[980px]:w-full max-[980px]:items-center max-[980px]:justify-center max-[980px]:rounded-lg max-[980px]:px-4 max-[980px]:py-[11px] max-[980px]:text-center"
              to="/admission"
            >
              Book a Tour
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}
