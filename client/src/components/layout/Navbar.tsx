import { useEffect, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { academicLinks, logoUrl, pageLinks } from '../../data/site';

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

type MenuKey = 'pages' | 'academics';

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

  const isPagesActive = pageLinks.some(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  );

  const isAcademicActive =
    pathname === '/academic' ||
    academicLinks.some((item) => pathname === item.path || pathname.startsWith(`${item.path}/`));

  const headerClassName = cx(
    'fixed left-0 top-0 z-[60] w-full bg-white',
    'shadow-[0_8px_24px_rgba(36,23,24,0.07)]',
    'transition-transform duration-[350ms] ease-in-out',
    isHidden && !isOpen && '-translate-y-full',
  );

  const topNavClassName = ({ isActive }: { isActive: boolean }) =>
    cx(
      'relative flex items-center',
      'font-[var(--f-head)] text-[14.5px] font-medium',
      'text-[var(--charcoal)]',
      'transition-colors duration-300',

      'after:absolute after:-bottom-1 after:left-0',
      'after:h-[2px] after:bg-[var(--burgundy)]',
      'after:transition-[width] after:duration-300',
      'after:content-[""]',

      'hover:text-[var(--burgundy)]',
      'hover:after:w-full',

      isActive ? 'font-semibold text-[var(--burgundy)] after:w-full' : 'opacity-80',

      // Mobile
      'max-[980px]:min-h-11',
      'max-[980px]:w-full',
      'max-[980px]:px-3',
      'max-[980px]:py-2.5',
      'max-[980px]:text-[13px]',
      'max-[980px]:leading-tight',
      'max-[980px]:after:hidden',
      'max-[980px]:hover:bg-[rgba(126,21,24,0.06)]',
    );

  const dropdownLinkClassName = ({ isActive }: { isActive: boolean }) =>
    cx(
      'relative block py-2.5 pl-4 pr-3',
      'font-[var(--f-head)] text-[14px] leading-snug',
      'text-[var(--charcoal)]',
      'transition-colors duration-200',

      'before:absolute before:bottom-1.5 before:left-0',
      'before:top-1.5 before:w-[2px]',
      'before:bg-transparent',
      'before:transition-colors before:duration-200',
      'before:content-[""]',

      'hover:text-[var(--burgundy)]',
      'hover:before:bg-[rgba(126,21,24,0.3)]',

      isActive && 'font-semibold text-[var(--burgundy)] before:bg-[var(--burgundy)]',

      // Mobile
      'max-[980px]:py-2.5',
      'max-[980px]:pl-3',
      'max-[980px]:text-[13px]',
    );

  const dropdownPanelClassName = (menu: MenuKey) =>
    cx(
      // Desktop
      'absolute left-1/2 top-full z-[80]',
      '-translate-x-1/2 -translate-y-1.5',
      'w-max',
      'border border-[rgba(36,23,24,0.1)]',
      'bg-white',
      'shadow-[0_18px_34px_-24px_rgba(36,23,24,0.55)]',

      // Hidden state
      'invisible opacity-0',

      // Desktop animation
      'transition-[opacity,transform,visibility]',
      'duration-[225ms] ease-out',

      'group-hover:visible',
      'group-hover:translate-y-0',
      'group-hover:opacity-100',

      'group-focus-within:visible',
      'group-focus-within:translate-y-0',
      'group-focus-within:opacity-100',

      menu === 'academics' ? 'min-w-[520px] px-5 py-4' : 'min-w-[300px] px-5 py-4',

      // Mobile
      'max-[980px]:static',
      'max-[980px]:w-full',
      'max-[980px]:min-w-0',
      'max-[980px]:translate-x-0',

      'max-[980px]:border-0',
      'max-[980px]:border-l',
      'max-[980px]:border-[rgba(126,21,24,0.15)]',

      'max-[980px]:bg-transparent',
      'max-[980px]:px-3',
      'max-[980px]:py-0',
      'max-[980px]:shadow-none',

      // Mobile smooth top-to-bottom animation
      'max-[980px]:visible',
      'max-[980px]:overflow-hidden',
      'max-[980px]:transition-[max-height,opacity,transform]',
      'max-[980px]:duration-[240ms]',
      'max-[980px]:ease-out',

      openMenu === menu
        ? [
            'max-[980px]:max-h-[520px]',
            'max-[980px]:translate-y-0',
            'max-[980px]:opacity-100',
          ].join(' ')
        : [
            'max-[980px]:max-h-0',
            'max-[980px]:-translate-y-1',
            'max-[980px]:opacity-0',
            'max-[980px]:pointer-events-none',
          ].join(' '),
    );

  const dropdownListClassName = (columns: 1 | 3) =>
    cx(
      'grid w-full list-none gap-x-8 gap-y-1',
      columns === 3 ? 'grid-cols-3' : 'grid-cols-1',
      'max-[980px]:grid-cols-1',
      'max-[980px]:gap-0',
    );

  const navItemClassName = (...extra: Array<string | false | null | undefined>) =>
    cx(
      'group relative -my-8 py-8',

      // Mobile
      'max-[980px]:my-0',
      'max-[980px]:grid',
      'max-[980px]:grid-cols-[minmax(0,1fr)_40px]',
      'max-[980px]:py-0',

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
      'hidden h-11 w-10 shrink-0 place-items-center',
      'border-0 bg-transparent',
      'text-[var(--charcoal)]',
      'transition-colors duration-200',
      'hover:bg-[rgba(126,21,24,0.06)]',

      'max-[980px]:grid',

      openMenu === menu && 'text-[var(--burgundy)]',
    );

  const menuArrowClassName = (menu: MenuKey) =>
    cx(
      'h-4 w-4',
      'transition-transform duration-[225ms] ease-out',
      openMenu === menu && 'rotate-180',
    );

  return (
    <div className="h-[86px] max-[980px]:h-[58px] max-[560px]:h-[54px]">
      <header className={headerClassName} data-header>
        <div
          className={cx(
            'relative flex w-full items-center justify-between',
            'px-10 py-4',

            'max-[1180px]:px-7',

            'max-[980px]:min-h-[58px]',
            'max-[980px]:gap-3',
            'max-[980px]:px-4',
            'max-[980px]:py-1.5',

            'max-[560px]:min-h-[54px]',
            'max-[560px]:px-3',
          )}
        >
          {/* Logo */}
          <div className="flex min-w-[120px] items-center max-[980px]:min-w-0">
            <Link to="/#hero" aria-label="Millennia World School home" onClick={closeNav}>
              <img
                className={cx(
                  'block h-[54px] w-[54px] object-contain',
                  'max-[980px]:h-10 max-[980px]:w-10',
                  'max-[560px]:h-9 max-[560px]:w-9',
                )}
                src={logoUrl}
                alt="MWS Logo"
              />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cx(
              'ml-auto hidden place-items-center',
              'h-10 w-10',
              'border border-[rgba(36,23,24,0.14)]',
              'bg-white',
              'text-[var(--charcoal)]',
              'transition-colors duration-200',
              'hover:border-[var(--burgundy)]',
              'hover:text-[var(--burgundy)]',

              'max-[980px]:grid',

              'max-[560px]:h-9',
              'max-[560px]:w-9',
            )}
            type="button"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
            aria-controls="primary-navigation"
            onClick={() => {
              setIsOpen((value) => !value);
              if (isOpen) {
                setOpenMenu(null);
              }
            }}
          >
            {isOpen ? <X size={20} strokeWidth={1.8} /> : <Menu size={20} strokeWidth={1.8} />}
          </button>

          {/* Navigation Popup */}
          <div
            className={cx(
              // Desktop
              'ml-auto flex items-center gap-[30px]',
              'max-[1180px]:gap-5',

              // Mobile popup positioning
              'max-[980px]:absolute',
              'max-[980px]:left-3',
              'max-[980px]:right-3',
              'max-[980px]:top-full',
              'max-[980px]:z-[120]',

              // Mobile popup layout
              'max-[980px]:m-0',
              'max-[980px]:flex',
              'max-[980px]:max-h-[calc(100dvh-78px)]',
              'max-[980px]:flex-col',
              'max-[980px]:items-stretch',

              // Mobile scroll
              'max-[980px]:overflow-y-auto',
              'max-[980px]:overscroll-contain',
              'max-[980px]:[-webkit-overflow-scrolling:touch]',

              // Popup styling
              'max-[980px]:border',
              'max-[980px]:border-[rgba(126,21,24,0.12)]',
              'max-[980px]:bg-white',
              'max-[980px]:p-2.5',
              'max-[980px]:shadow-[0_18px_38px_rgba(36,23,24,0.14)]',

              // Popup animation
              'max-[980px]:transition-[max-height,opacity,transform]',
              'max-[980px]:duration-[240ms]',
              'max-[980px]:ease-out',

              // Small phones
              'max-[560px]:left-2',
              'max-[560px]:right-2',
              'max-[560px]:p-2',

              isOpen
                ? [
                    'max-[980px]:translate-y-0',
                    'max-[980px]:opacity-100',
                    'max-[980px]:pointer-events-auto',
                  ].join(' ')
                : [
                    'max-[980px]:max-h-0',
                    'max-[980px]:-translate-y-2',
                    'max-[980px]:overflow-hidden',
                    'max-[980px]:opacity-0',
                    'max-[980px]:pointer-events-none',
                  ].join(' '),
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
              <ul
                className={cx(
                  'flex list-none items-center gap-[30px]',
                  'max-[1180px]:gap-5',

                  'max-[980px]:grid',
                  'max-[980px]:w-full',
                  'max-[980px]:gap-1',
                )}
              >
                {/* Home */}
                <li className="max-[980px]:grid max-[980px]:grid-cols-[minmax(0,1fr)]">
                  <NavLink to="/#hero" className={topNavClassName}>
                    Home
                  </NavLink>
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
                    <ChevronDown className={menuArrowClassName('pages')} strokeWidth={1.8} />
                  </button>

                  <div className={dropdownPanelClassName('pages')}>
                    <ul className={dropdownListClassName(1)}>
                      {pageLinks.map((item) => (
                        <li key={item.path}>
                          <NavLink to={item.path} className={dropdownLinkClassName}>
                            <span className="block">{item.label}</span>
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
                    <ChevronDown className={menuArrowClassName('academics')} strokeWidth={1.8} />
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

                {/* School Calendar */}
                <li className="max-[980px]:grid max-[980px]:grid-cols-[minmax(0,1fr)]">
                  <NavLink to="/school-calendar" className={topNavClassName}>
                    School Calendar
                  </NavLink>
                </li>

                {/* News */}
                <li className="max-[980px]:grid max-[980px]:grid-cols-[minmax(0,1fr)]">
                  <NavLink to="/news" className={topNavClassName}>
                    News
                  </NavLink>
                </li>

                {/* Contact */}
                <li className="max-[980px]:grid max-[980px]:grid-cols-[minmax(0,1fr)]">
                  <NavLink to="/contact" className={topNavClassName}>
                    Contact
                  </NavLink>
                </li>
              </ul>
            </nav>

            {/* Book a Tour */}
            <Link
              className={cx(
                'border border-[var(--burgundy)]',
                'px-[22px] py-2.5',
                'text-sm font-[var(--f-head)] font-semibold',
                'text-[var(--burgundy)]',
                'transition-[background,color] duration-300',
                'hover:bg-[var(--burgundy)] hover:text-white',

                // Mobile CTA
                'max-[980px]:mt-3',
                'max-[980px]:flex',
                'max-[980px]:min-h-11',
                'max-[980px]:w-full',
                'max-[980px]:shrink-0',
                'max-[980px]:items-center',
                'max-[980px]:justify-center',
                'max-[980px]:px-4',
                'max-[980px]:py-3',
                'max-[980px]:text-center',
              )}
              to="/book-a-tour"
            >
              Book a Tour
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}
