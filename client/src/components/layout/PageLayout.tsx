import { useCallback, useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link, Outlet, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import Chatbot from "./Chatbot";
import Footer from "./Footer";
import Navbar from "./Navbar";

const ANNOUNCEMENT_SESSION_KEY = "mws-public-announcement-dismissed";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type AosAnimation =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "fade-up-right"
  | "fade-up-left"
  | "fade-down-right"
  | "fade-down-left";

function hasMedia(element: HTMLElement) {
  return Boolean(element.querySelector("img, picture, video"));
}

function hasGridLayout(element: HTMLElement) {
  return Boolean(
    element.querySelector(
      ".grid, [class*='grid-cols'], [class*='md:grid-cols'], [class*='lg:grid-cols']",
    ),
  );
}

function isCtaLike(element: HTMLElement) {
  const metadata = `${element.id} ${element.className} ${
    element.getAttribute("aria-label") ?? ""
  }`.toLowerCase();

  return (
    metadata.includes("cta") ||
    metadata.includes("contact") ||
    metadata.includes("admission")
  );
}

function isHeroLike(element: HTMLElement) {
  return (
    element.id === "hero" ||
    element.closest("#hero") !== null ||
    element.classList.contains("hero") ||
    element.className.toLowerCase().includes("hero")
  );
}

function getPublicAosAnimation(element: HTMLElement, index: number): AosAnimation {
  if (isCtaLike(element)) {
    return "fade-up";
  }

  if (hasMedia(element)) {
    return index % 2 === 0 ? "fade-right" : "fade-left";
  }

  if (hasGridLayout(element)) {
    return index % 2 === 0 ? "fade-up-right" : "fade-up-left";
  }

  const directionalAnimations: AosAnimation[] = [
    "fade-up",
    "fade-down",
    "fade-up-right",
    "fade-up-left",
    "fade-down-right",
    "fade-down-left",
  ];

  return directionalAnimations[index % directionalAnimations.length];
}

function setManagedAosAttributes(
  element: HTMLElement,
  animation: AosAnimation,
  index: number,
) {
  if (isHeroLike(element)) {
    return;
  }

  if (
    element.hasAttribute("data-aos") &&
    element.getAttribute("data-aos-managed") !== "true"
  ) {
    return;
  }

  element.setAttribute("data-aos", animation);
  element.setAttribute("data-aos-managed", "true");
  element.setAttribute("data-aos-duration", "550");
  element.setAttribute("data-aos-easing", "ease-out-cubic");
  element.setAttribute("data-aos-once", "true");
  element.setAttribute("data-aos-offset", "72");
  element.setAttribute("data-aos-delay", String(Math.min(index * 30, 120)));
}

function applyPublicAosAttributes() {
  const sections = document.querySelectorAll<HTMLElement>(
    ".site-content main > section:not(#hero), .site-content main > div, .site-content article, .site-content [data-public-reveal]",
  );

  sections.forEach((element, index) => {
    setManagedAosAttributes(element, getPublicAosAnimation(element, index), index);
  });
}

function hasDismissedAnnouncement() {
  try {
    return sessionStorage.getItem(ANNOUNCEMENT_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function storeAnnouncementDismissal() {
  try {
    sessionStorage.setItem(ANNOUNCEMENT_SESSION_KEY, "true");
  } catch {
    // Keep the popup functional even when sessionStorage is unavailable.
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
      document.body.style.overflow = "";
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePopup();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePopup, isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[10020] flex items-center justify-center bg-[rgba(36,23,24,0.58)] px-5 py-8 backdrop-blur-sm"
      role="presentation"
    >
      <section
        className="relative flex w-full max-w-[480px] flex-col items-center justify-center border border-[rgba(214,161,58,0.38)] bg-white px-7 py-9 text-center text-[var(--charcoal)] shadow-[0_28px_80px_rgba(36,23,24,0.34)] sm:px-10 sm:py-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="public-announcement-title"
        aria-describedby="public-announcement-copy"
      >
        <button
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center border border-[var(--border)] bg-white text-[var(--charcoal)] transition-colors duration-200 hover:border-[var(--burgundy)] hover:bg-[var(--burgundy)] hover:text-white motion-reduce:transition-none"
          type="button"
          aria-label="Close announcement"
          onClick={closePopup}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <h1
          id="public-announcement-title"
          className="max-w-[380px] text-[clamp(26px,3.2vw,34px)] font-semibold leading-[1.16] text-[var(--charcoal)]"
        >
          Book a Personalised MWS Tour
        </h1>
        <p
          id="public-announcement-copy"
          className="mt-4 max-w-[390px] text-[15px] leading-[1.7] text-[var(--charcoal-muted)] sm:text-base"
        >
          Meet our team, explore the learning spaces, and see how Mutiara
          Waldorf School supports each child with warmth, rhythm, and purpose.
        </p>
        <Link
          className="mt-7 inline-flex min-h-[46px] items-center justify-center border border-[var(--burgundy)] bg-[var(--burgundy)] px-6 py-3 font-[var(--f-head)] text-sm font-bold uppercase text-white transition-colors duration-200 hover:border-[var(--burgundy-dark)] hover:bg-[var(--burgundy-dark)] hover:text-white motion-reduce:transition-none max-[560px]:w-full"
          to="/contact"
          onClick={closePopup}
        >
          Book Now
        </Link>
      </section>
    </div>
  );
}

export default function PageLayout() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) console.info("[PUBLIC][AOS] Initializing...");
    applyPublicAosAttributes();

    AOS.init({
      disable: prefersReducedMotion,
      duration: 550,
      easing: "ease-out-cubic",
      once: true,
    });

    if (import.meta.env.DEV) console.info("[PUBLIC][AOS] Initialized");
  }, []);

  useEffect(() => {
    applyPublicAosAttributes();
    AOS.refreshHard();
  }, [pathname]);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-header]");

    if (!header) {
      return;
    }

    const syncNavbarHeight = () => {
      const height = Math.ceil(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--navbar-height", `${height}px`);
    };

    syncNavbarHeight();

    window.addEventListener("resize", syncNavbarHeight);

    if (!("ResizeObserver" in window)) {
      return () => window.removeEventListener("resize", syncNavbarHeight);
    }

    const resizeObserver = new ResizeObserver(syncNavbarHeight);
    resizeObserver.observe(header);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", syncNavbarHeight);
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
          getComputedStyle(document.documentElement).getPropertyValue("--navbar-height"),
        );
        const targetTop = target.getBoundingClientRect().top + window.scrollY;

        window.scrollTo({
          top: Math.max(0, targetTop - (Number.isFinite(navbarHeight) ? navbarHeight : 0)),
          behavior: "instant",
        });
      });
      return;
    }

    window.scrollTo({ top: 0, behavior: "instant" });
  }, [hash, pathname]);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const revealItems = document.querySelectorAll(".reveal, [data-reveal]");
    const markRevealed = (element: Element) => {
      element.classList.add("in");
      element.setAttribute("data-revealed", "true");
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
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
      <div className="site-content">
        <Outlet />
      </div>
      <Footer />
      <Chatbot />
      <PublicAnnouncementPopup />
    </>
  );
}
