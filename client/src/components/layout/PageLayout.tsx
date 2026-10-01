import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Chatbot from './Chatbot';
import Footer from './Footer';
import Navbar from './Navbar';
import { refreshPublicAos, syncPublicAos, watchPublicAos } from './publicAos';
import { trackPageView } from '@/lib/analytics';
import PopupInfo from '../ui/PopupInfo';

const ANNOUNCEMENT_SESSION_KEY = 'mws-public-announcement-dismissed';

function hasDismissedAnnouncement() {
  try {
    return sessionStorage.getItem(ANNOUNCEMENT_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
}

function storeAnnouncementDismissal() {
  try {
    sessionStorage.setItem(ANNOUNCEMENT_SESSION_KEY, 'true');
  } catch {
    // Ignore blocked session storage; the popup can show again next visit.
  }
}

function PublicAnnouncementPopup() {
  const [isOpen, setIsOpen] = useState(() => !hasDismissedAnnouncement());

  const closePopup = useCallback(() => {
    storeAnnouncementDismissal();
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePopup();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closePopup, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <PopupInfo
      title="Book a Personalised MWS Tour"
      description="Meet our team, explore the learning spaces, and see how Mutiara Waldorf School supports each child with warmth, rhythm, and purpose."
      buttonText="Book Now"
      buttonTo="/contact"
      onClose={closePopup}
    />
  );
}

export default function PageLayout() {
  const { hash, pathname } = useLocation();
  const siteContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pageName = pathname
      .split('/')
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, '')
      .replace(/\b\w/g, (char) => char.toUpperCase());

    document.title =
      pathname === '/'
        ? 'Millennia World School'
        : `${pageName ?? 'Page'} - Millennia World School`;
  }, [pathname]);

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);
  useLayoutEffect(() => {
    if (!syncPublicAos() || !siteContentRef.current) {
      return;
    }

    const watcher = watchPublicAos(siteContentRef.current);

    return () => watcher.disconnect();
  }, [pathname]);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>('[data-header]');

    if (!header) {
      return;
    }

    const syncNavbarHeight = () => {
      const height = Math.ceil(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--navbar-height', `${height}px`);
    };

    syncNavbarHeight();

    window.addEventListener('resize', syncNavbarHeight);

    if (!('ResizeObserver' in window)) {
      return () => window.removeEventListener('resize', syncNavbarHeight);
    }

    const resizeObserver = new ResizeObserver(syncNavbarHeight);
    resizeObserver.observe(header);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncNavbarHeight);
    };
  }, []);

  useEffect(() => {
    if (hash) {
      window.requestAnimationFrame(() => {
        const target = document.querySelector(hash);
        if (!target) {
          return;
        }
        const navbarHeight = Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'),
        );
        const targetTop = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: Math.max(0, targetTop - (Number.isFinite(navbarHeight) ? navbarHeight : 0)),
          behavior: 'instant',
        });
        refreshPublicAos();
      });

      return;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    refreshPublicAos();
  }, [hash, pathname]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const revealItems = document.querySelectorAll('.reveal, [data-reveal]');

    const markRevealed = (element: Element) => {
      element.classList.add('in');
      element.setAttribute('data-revealed', 'true');
    };

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach(markRevealed);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            markRevealed(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    revealItems.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [pathname]);

  return (
    <>
      <Navbar />
      <div className="navbar-spacer" aria-hidden="true" />
      <div className="site-content" ref={siteContentRef}>
        <Outlet />
      </div>
      <Footer />
      <Chatbot />
      <PublicAnnouncementPopup />
    </>
  );
}
