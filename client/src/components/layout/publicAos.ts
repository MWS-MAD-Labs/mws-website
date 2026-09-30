import AOS from "aos";
import "aos/dist/aos.css";
  
const READY_CLASS = "aos-ready";
const PREPARING_CLASS = "aos-preparing";
const MOBILE_QUERY = "(max-width: 767px)";

const FALLBACK_REVEAL_DELAY_MS = 700;

type PublicAosAnimation = "fade-up" | "fade-left" | "fade-right";

let isInitialized = false;

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function hasMedia(element: HTMLElement) {
  return Boolean(element.querySelector("img, picture, video"));
}

function isHeroLike(element: HTMLElement) {
  return (
    element.id === "hero" ||
    element.closest("#hero") !== null ||
    element.classList.contains("hero") ||
    element.className.toLowerCase().includes("hero")
  );
}

function getPublicAosAnimation(element: HTMLElement, index: number): PublicAosAnimation {
  if (!window.matchMedia(MOBILE_QUERY).matches && hasMedia(element)) {
    return index % 2 === 0 ? "fade-right" : "fade-left";
  }

  return "fade-up";
}

function setManagedAosAttributes(element: HTMLElement, index: number) {
  if (isHeroLike(element)) {
    return;
  }

  if (
    element.hasAttribute("data-aos") &&
    element.getAttribute("data-aos-managed") !== "true"
  ) {
    return;
  }

  element.setAttribute("data-aos", getPublicAosAnimation(element, index));
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

  sections.forEach((element, index) => setManagedAosAttributes(element, index));
}

function removeManagedAosAttributes() {
  document
    .querySelectorAll<HTMLElement>("[data-aos-managed='true']")
    .forEach((element) => {
      element.removeAttribute("data-aos");
      element.removeAttribute("data-aos-managed");
      element.classList.remove("aos-init", "aos-animate");
    });
}

function revealElement(element: Element) {
  element.classList.add("aos-init", "aos-animate");
}

export function syncPublicAos(): boolean {
  const root = document.documentElement;

  if (prefersReducedMotion()) {
    removeManagedAosAttributes();
    root.classList.remove(READY_CLASS);
    return false;
  }

  // AOS reads offsetTop while preparing, which forces a style pass. Both
  // classes must already be set by then, or content that was painted visible
  // transitions out to its hidden starting state.
  root.classList.add(READY_CLASS, PREPARING_CLASS);

  try {
    applyPublicAosAttributes();

    if (!isInitialized) {
      AOS.init({
        duration: 550,
        easing: "ease-out-cubic",
        once: true,
      });
      isInitialized = true;
    } else {
      AOS.refreshHard();
    }

    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => root.classList.remove(PREPARING_CLASS)),
    );
    return true;
  } catch (error) {
    if (import.meta.env.DEV) console.error("[PUBLIC][AOS] Disabled:", error);
    removeManagedAosAttributes();
    root.classList.remove(READY_CLASS, PREPARING_CLASS);
    return false;
  }
}

export function refreshPublicAos() {
  if (!isInitialized || !document.documentElement.classList.contains(READY_CLASS)) {
    return;
  }

  AOS.refresh();
}

export function watchPublicAos(container: HTMLElement) {
  let refreshTimer = 0;
  const revealTimers = new Map<Element, number>();

  const scheduleRefresh = () => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(refreshPublicAos, 150);
  };

  const resizeObserver =
    "ResizeObserver" in window ? new ResizeObserver(scheduleRefresh) : null;
  resizeObserver?.observe(container);
  window.addEventListener("load", refreshPublicAos);

  const intersectionObserver =
    "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const pending = revealTimers.get(entry.target);

            if (!entry.isIntersecting) {
              if (pending) window.clearTimeout(pending);
              revealTimers.delete(entry.target);
              return;
            }

            if (pending) return;

            revealTimers.set(
              entry.target,
              window.setTimeout(() => {
                revealTimers.delete(entry.target);
                revealElement(entry.target);
                intersectionObserver?.unobserve(entry.target);
              }, FALLBACK_REVEAL_DELAY_MS),
            );
          });
        })
      : null;

  document
    .querySelectorAll("[data-aos]:not(.aos-animate)")
    .forEach((element) => intersectionObserver?.observe(element));

  return {
    disconnect() {
      window.clearTimeout(refreshTimer);
      revealTimers.forEach((timer) => window.clearTimeout(timer));
      revealTimers.clear();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener("load", refreshPublicAos);
    },
  };
}
