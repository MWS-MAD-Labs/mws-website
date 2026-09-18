import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { academicLinks, logoUrl, pageLinks } from '../../data/site';

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export default function Navbar() {
  const { pathname } = useLocation();

  const [isHidden, setIsHidden] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const syncHeader = () => {
      const currentY = window.scrollY;

      if (currentY <= 24) {
        setIsHidden(false);
      } else if (currentY > lastScrollY && currentY > 80) {
        // Scroll down
        setIsHidden(true);
      } else if (currentY < lastScrollY) {
        // Scroll up
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
      "relative pb-1 font-[var(--f-head)] text-[14.5px] font-medium text-[var(--charcoal)] transition-colors duration-[300ms] after:absolute after:bottom-0 after:left-0 after:h-px after:bg-[var(--burgundy)] after:transition-[width] after:duration-300 after:content-[''] hover:text-[var(--burgundy)] hover:after:w-full max-[980px]:flex max-[980px]:min-h-10 max-[980px]:w-full max-[980px]:items-center max-[980px]:justify-start max-[980px]:rounded-md max-[980px]:px-2.5 max-[980px]:py-[9px] max-[980px]:text-[13px] max-[980px]:leading-tight max-[980px]:after:hidden max-[980px]:hover:bg-[rgba(126,21,24,0.06)] max-[680px]:text-xs",
      isActive
        ? 'font-semibold text-[var(--burgundy)] opacity-100 after:w-full max-[980px]:bg-[rgba(126,21,24,0.08)]'
        : 'opacity-75',
    );

  const dropdownLinkClassName = ({ isActive }: { isActive: boolean }) =>
    cx(
      'block whitespace-nowrap px-3 py-2.5 text-[13.5px] leading-tight text-[var(--charcoal)] transition-colors duration-[250ms] after:hidden hover:bg-[rgba(126,21,24,0.07)] hover:text-[var(--burgundy)] max-[980px]:min-h-[34px] max-[980px]:whitespace-normal max-[980px]:rounded-md max-[980px]:px-2.5 max-[980px]:py-2 max-[980px]:text-[12.5px] max-[980px]:hover:bg-[rgba(126,21,24,0.07)]',
      isActive
        ? 'bg-[rgba(126,21,24,0.08)] font-semibold text-[var(--burgundy)] opacity-100'
        : 'opacity-75',
    );

  const dropdownItemClassName = (isActive: boolean, menu: string) =>
    cx(
      'group/dropdown relative max-[980px]:grid max-[980px]:grid-cols-[1fr_38px] max-[980px]:items-start',
      isActive && '[&>a]:text-[var(--burgundy)] [&>a]:after:w-full',
      openMenu === menu &&
        'max-[980px]:[&>button>span]:translate-y-0 max-[980px]:[&>button>span]:rotate-[225deg]',
    );

  const dropdownMenuClassName = (menu: string, isAcademic = false) =>
    cx(
      "invisible absolute left-[-18px] top-[calc(100%+14px)] z-[80] flex min-w-[220px] translate-y-2.5 flex-col gap-0 border border-[rgba(86,28,34,0.1)] bg-white p-2.5 opacity-0 shadow-[0_18px_42px_rgba(25,24,23,0.12)] transition-[opacity,transform,visibility] duration-200 before:absolute before:-top-4 before:left-0 before:right-0 before:h-4 before:content-[''] group-hover/dropdown:visible group-hover/dropdown:translate-y-0 group-hover/dropdown:opacity-100 group-focus-within/dropdown:visible group-focus-within/dropdown:translate-y-0 group-focus-within/dropdown:opacity-100 max-[980px]:static max-[980px]:col-span-full max-[980px]:m-0 max-[980px]:min-w-0 max-[980px]:translate-y-0 max-[980px]:border-0 max-[980px]:border-l max-[980px]:border-[rgba(126,21,24,0.15)] max-[980px]:bg-transparent max-[980px]:p-0 max-[980px]:pl-2.5 max-[980px]:shadow-none max-[980px]:opacity-100 max-[980px]:before:hidden",
      isAcademic && 'min-w-[300px]',
      openMenu === menu
        ? 'max-[980px]:grid max-[980px]:visible max-[980px]:pointer-events-auto'
        : 'max-[980px]:hidden max-[980px]:pointer-events-none',
    );

  const toggleMenu = (menu: string) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const closeNav = () => {
    setIsOpen(false);
    setOpenMenu(null);
  };

  return (
    <div className="h-[86px] max-[980px]:h-[58px] max-[560px]:h-[54px]">
      <header className={headerClassName} data-header>
        <div
          className={cx(
            'relative flex w-full items-center justify-between px-10 py-4 transition-transform duration-[350ms] ease-in-out max-[1180px]:px-7 max-[980px]:min-h-[58px] max-[980px]:gap-3 max-[980px]:px-4 max-[980px]:py-1.5 max-[560px]:min-h-[54px] max-[560px]:px-3',
          )}
        >
          {/* Logo */}
          <div className="flex min-w-[120px] items-center justify-start max-[980px]:min-w-0">
            <Link to="/#hero" aria-label="Millennia World School home">
              <img
                className="block h-[54px] w-[54px] object-contain max-[980px]:h-[40px] max-[980px]:w-[40px] max-[560px]:h-[36px] max-[560px]:w-[36px]"
                src={logoUrl}
                alt="MWS Logo"
              />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="ml-auto hidden h-10 w-10 cursor-pointer place-items-center rounded-lg border border-[rgba(36,23,24,0.14)] bg-white text-[var(--charcoal)] max-[980px]:grid max-[560px]:h-9 max-[560px]:w-9"
            type="button"
            aria-label="Open navigation menu"
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
                'my-0.5 block h-0.5 w-5 rounded-full bg-current transition-[opacity,transform] duration-200',
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
              'ml-auto flex items-center gap-[30px] max-[1180px]:gap-[18px] max-[980px]:absolute max-[980px]:left-3 max-[980px]:right-3 max-[980px]:top-full max-[980px]:z-[120] max-[980px]:m-0 max-[980px]:max-h-[calc(100dvh-78px)] max-[980px]:w-auto max-[980px]:overflow-y-auto max-[980px]:overflow-x-hidden max-[980px]:rounded-lg max-[980px]:border max-[980px]:border-[rgba(126,21,24,0.12)] max-[980px]:bg-white max-[980px]:p-2.5 max-[980px]:shadow-[0_18px_38px_rgba(36,23,24,0.14)] max-[560px]:left-2 max-[560px]:right-2 max-[560px]:max-h-[calc(100dvh-70px)] max-[560px]:p-2',
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
              className="flex items-center max-[980px]:block"
              id="primary-navigation"
              aria-label="Main navigation"
            >
              <ul className="flex list-none items-center gap-[30px] max-[1180px]:gap-5 max-[980px]:grid max-[980px]:w-full max-[980px]:gap-0.5">
                {/* Home */}
                <li className={dropdownItemClassName(pathname === '/', 'home')}>
                  <NavLink to="/#hero" className={topNavClassName}>
                    Home
                  </NavLink>

                  <button
                    className="hidden h-10 w-[38px] place-items-center rounded-md border-0 bg-transparent text-[var(--charcoal)] max-[980px]:grid"
                    type="button"
                    aria-label="Open home menu"
                    aria-expanded={openMenu === 'home'}
                    onClick={() => toggleMenu('home')}
                  >
                    <span className="h-[9px] w-[9px] translate-y-[-2px] rotate-45 border-b-2 border-r-2 border-current transition-transform duration-200" />
                  </button>

                  <ul className={dropdownMenuClassName('home')}>
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
                </li>

                {/* Pages */}
                <li className={dropdownItemClassName(isPagesActive, 'pages')}>
                  <NavLink to="/our-school" className={topNavClassName}>
                    Pages
                  </NavLink>

                  <button
                    className="hidden h-10 w-[38px] place-items-center rounded-md border-0 bg-transparent text-[var(--charcoal)] max-[980px]:grid"
                    type="button"
                    aria-label="Open pages menu"
                    aria-expanded={openMenu === 'pages'}
                    onClick={() => toggleMenu('pages')}
                  >
                    <span className="h-[9px] w-[9px] translate-y-[-2px] rotate-45 border-b-2 border-r-2 border-current transition-transform duration-200" />
                  </button>

                  <ul className={dropdownMenuClassName('pages')}>
                    {pageLinks.map((item) => (
                      <li key={item.path}>
                        <NavLink to={item.path} className={dropdownLinkClassName}>
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>

                {/* Academics */}
                <li className={dropdownItemClassName(isAcademicActive, 'academics')}>
                  <NavLink to="/academic" className={topNavClassName}>
                    Academics
                  </NavLink>

                  <button
                    className="hidden h-10 w-[38px] place-items-center rounded-md border-0 bg-transparent text-[var(--charcoal)] max-[980px]:grid"
                    type="button"
                    aria-label="Open academics menu"
                    aria-expanded={openMenu === 'academics'}
                    onClick={() => toggleMenu('academics')}
                  >
                    <span className="h-[9px] w-[9px] translate-y-[-2px] rotate-45 border-b-2 border-r-2 border-current transition-transform duration-200" />
                  </button>

                  <ul className={dropdownMenuClassName('academics', true)}>
                    {academicLinks.map((item) => (
                      <li key={item.path}>
                        <NavLink to={item.path} className={dropdownLinkClassName}>
                          {item.label}

                          <span className="mt-1 block whitespace-normal text-[11px] font-[var(--f-body)] font-medium leading-[1.35] text-[var(--charcoal-muted)]">
                            {item.description}
                          </span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
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
              className={cx(
                'border border-[var(--burgundy)] px-[22px] py-2.5 text-sm font-[var(--f-head)] font-semibold text-[var(--burgundy)] transition-[background,color] duration-300 hover:bg-[var(--burgundy)] hover:text-white max-[980px]:mt-2 max-[980px]:flex max-[980px]:min-h-11 max-[980px]:w-full max-[980px]:items-center max-[980px]:justify-center max-[980px]:rounded-lg max-[980px]:px-4 max-[980px]:py-[11px] max-[980px]:text-center max-[980px]:text-[0.88rem] max-[980px]:font-extrabold max-[980px]:leading-tight',
              )}
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
