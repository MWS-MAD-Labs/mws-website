import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Chatbot from './Chatbot';
import Footer from './Footer';
import Navbar from './Navbar';
import { refreshPublicAos, syncPublicAos, watchPublicAos } from './publicAos';
import { trackPageView } from '@/lib/analytics';
import PopupInfo from '../ui/PopupInfo';
import { pageApi, type PublicPopupPromoted } from '@/api/pageApi';
import {
  NOT_FOUND_PAGE_TITLE,
  PUBLIC_SITE_NAME,
  publicDocumentTitle,
} from '@/constants/pageTitles';

const ANNOUNCEMENT_SESSION_KEY_PREFIX = 'mws-public-popup-promoted-dismissed';

function announcementSessionKey(popup: PublicPopupPromoted) {
  return `${ANNOUNCEMENT_SESSION_KEY_PREFIX}:${popup.id}:${popup.updatedAt}`;
}

function hasDismissedAnnouncement(popup: PublicPopupPromoted) {
  try {
    return sessionStorage.getItem(announcementSessionKey(popup)) === 'true';
  } catch {
    return false;
  }
}

function storeAnnouncementDismissal(popup: PublicPopupPromoted) {
  try {
    sessionStorage.setItem(announcementSessionKey(popup), 'true');
  } catch {
    // Ignore blocked session storage; the popup can show again next visit.
  }
}

function PublicAnnouncementPopup() {
  const [popup, setPopup] = useState<PublicPopupPromoted | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const closePopup = useCallback(() => {
    if (popup) storeAnnouncementDismissal(popup);
    setIsOpen(false);
  }, [popup]);

  useEffect(() => {
    let isCurrent = true;

    pageApi
      .activePopupPromoted()
      .then((item) => {
        if (!isCurrent || !item) return;
        setPopup(item);
        setIsOpen(!hasDismissedAnnouncement(item));
      })
      .catch(() => {
        if (!isCurrent) return;
        setPopup(null);
        setIsOpen(false);
      });

    return () => {
      isCurrent = false;
    };
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

  if (!isOpen || !popup) {
    return null;
  }

  return (
    <PopupInfo
      title={popup.title}
      description={popup.description}
      buttonText={popup.buttonText || 'Close'}
      buttonTo={popup.buttonUrl || undefined}
      imageAlt={popup.posterImageAlt}
      imageSrc={popup.posterImagePath}
      openInNewTab={popup.openInNewTab}
      onClose={closePopup}
    />
  );
}

const routeTitles: Record<string, string> = {
  '/': PUBLIC_SITE_NAME,
  '/about-millennia': 'About MWS',
  '/our-school': 'Our School',
  '/admission': 'Admission',
  '/admission/faq': 'Admission FAQ',
  // '/admission/guidelines': 'Admission Guidelines',
  '/book-a-tour': 'Book a Tour',
  '/academic': 'Academic',
  '/academic/kindergarten': 'Kindergarten',
  '/academic/elementary': 'Elementary',
  '/academic/high-school': 'High School',
  '/academic/junior-high': 'Junior High',
  '/kindergarten': 'Kindergarten',
  '/elementary': 'Elementary',
  '/high-school': 'High School',
  '/junior-high': 'Junior High',
  '/kurikulum': 'Curriculum',
  '/school-calendar': 'School Calendar',
  '/news': 'School News',
  '/school-news': 'School News',
  '/community-stories': 'Community Stories',
  '/contact': 'Contact',
  '/virtual-tour': 'Virtual Tour',
};

function titleFromPath(pathname: string) {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

  if (routeTitles[normalizedPath]) return routeTitles[normalizedPath];
  if (/^\/news\/[^/]+$/.test(normalizedPath)) return 'School News';

  // Every other public URL renders the 404 page.
  return NOT_FOUND_PAGE_TITLE;
}

export default function PageLayout() {
  const { hash, pathname } = useLocation();
  const siteContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = publicDocumentTitle(titleFromPath(pathname));
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
