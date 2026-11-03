import AOS from 'aos';
import 'aos/dist/aos.css';

const READY_CLASS = 'aos-ready';
const PREPARING_CLASS = 'aos-preparing';

const FALLBACK_REVEAL_DELAY_MS = 700;

const ANIMATION_DURATION = 650;
// Keep in sync with the card-rise animation in index.css.
const CARD_ANIMATION_DURATION = 700;
// Custom easing name; the curve itself is defined in index.css.
const ANIMATION_EASING = 'smooth-out';
// Start once the element is 12% of the viewport above the bottom edge.
const ANIMATION_OFFSET_RATIO = 0.12;
const STAGGER_DELAY = 70;
const MAX_STAGGER_STEPS = 5;
// Taller blocks (e.g. an article body) only fade up; tilting them looks odd.
const MAX_CARD_HEIGHT_RATIO = 0.9;

type PublicAosAnimation = 'fade-up' | 'card-rise';

const PUBLIC_AOS_SELECTOR =
  '.site-content main > section:not(#hero):not([data-no-aos]), .site-content main > div:not([data-no-aos]), .site-content article:not([data-no-aos]), .site-content [data-public-reveal]:not([data-no-aos])';

let isInitialized = false;

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isHeroLike(element: HTMLElement) {
  return (
    element.id === 'hero' ||
    element.closest('#hero') !== null ||
    element.classList.contains('hero') ||
    element.className.toLowerCase().includes('hero')
  );
}

function getPublicAosAnimation(element: HTMLElement, isCard: boolean): PublicAosAnimation {
  return isCard && element.offsetHeight <= window.innerHeight * MAX_CARD_HEIGHT_RATIO
    ? 'card-rise'
    : 'fade-up';
}

function setManagedAosAttributes(element: HTMLElement, index: number, isCard: boolean) {
  if (isHeroLike(element)) {
    return;
  }

  if (element.hasAttribute('data-aos') && element.getAttribute('data-aos-managed') !== 'true') {
    return;
  }

  const animation = getPublicAosAnimation(element, isCard);

  element.setAttribute('data-aos', animation);
  element.setAttribute('data-aos-managed', 'true');
  element.setAttribute(
    'data-aos-duration',
    String(animation === 'card-rise' ? CARD_ANIMATION_DURATION : ANIMATION_DURATION),
  );
  element.setAttribute('data-aos-easing', ANIMATION_EASING);
  element.setAttribute('data-aos-once', 'true');
  element.setAttribute(
    'data-aos-offset',
    String(Math.round(window.innerHeight * ANIMATION_OFFSET_RATIO)),
  );

  // aos.css only ships delays in 50ms steps, so the stagger goes through a CSS
  // variable (index.css) that card images also use for their zoom.
  const delay = Math.min(index, MAX_STAGGER_STEPS) * STAGGER_DELAY;
  element.style.setProperty('--reveal-delay', `${delay}ms`);
}

function applyPublicAosAttributes() {
  const sections = document.querySelectorAll<HTMLElement>(PUBLIC_AOS_SELECTOR);

  const groupIndexes = new Map<Element, number>();

  sections.forEach((element) => {
    const parent = element.parentElement;

    // Page sections enter the viewport one at a time, so they never stagger.
    if (!parent || parent.tagName === 'MAIN') {
      setManagedAosAttributes(element, 0, false);
      return;
    }

    // Cards wrapped in their own <li> stagger across the whole list.
    const group = parent.tagName === 'LI' && parent.parentElement ? parent.parentElement : parent;
    const index = groupIndexes.get(group) ?? 0;

    setManagedAosAttributes(element, index, true);
    groupIndexes.set(group, index + 1);
  });
}

function removeManagedAosAttributes() {
  document.querySelectorAll<HTMLElement>("[data-aos-managed='true']").forEach((element) => {
    element.removeAttribute('data-aos');
    element.removeAttribute('data-aos-managed');
    element.removeAttribute('data-aos-duration');
    element.removeAttribute('data-aos-easing');
    element.removeAttribute('data-aos-once');
    element.removeAttribute('data-aos-offset');
    element.removeAttribute('data-aos-delay');
    element.style.removeProperty('--reveal-delay');
    element.classList.remove('aos-init', 'aos-animate');
  });
}

function hasUnmanagedElements() {
  return [...document.querySelectorAll<HTMLElement>(PUBLIC_AOS_SELECTOR)].some(
    (element) => !element.hasAttribute('data-aos') && !isHeroLike(element),
  );
}

function revealElement(element: Element) {
  element.classList.add('aos-init', 'aos-animate');
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
        duration: ANIMATION_DURATION,
        easing: ANIMATION_EASING,
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
    if (import.meta.env.DEV) {
      console.error('[PUBLIC][AOS] Disabled:', error);
    }

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
  let syncTimer = 0;

  const revealTimers = new Map<Element, number>();

  const scheduleRefresh = () => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(refreshPublicAos, 150);
  };

  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(scheduleRefresh) : null;

  resizeObserver?.observe(container);

  window.addEventListener('load', refreshPublicAos);

  const intersectionObserver =
    'IntersectionObserver' in window
      ? new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const pending = revealTimers.get(entry.target);

            if (!entry.isIntersecting) {
              if (pending) {
                window.clearTimeout(pending);
              }

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

  const observePending = () =>
    document
      .querySelectorAll('[data-aos]:not(.aos-animate)')
      .forEach((element) => intersectionObserver?.observe(element));

  observePending();

  // Cards that render after their API data arrives (news, level pages) miss
  // the first pass, so pick them up once the DOM settles.
  const mutationObserver = new MutationObserver(() => {
    window.clearTimeout(syncTimer);
    syncTimer = window.setTimeout(() => {
      if (hasUnmanagedElements() && syncPublicAos()) {
        observePending();
      }
    }, 120);
  });

  mutationObserver.observe(container, { childList: true, subtree: true });

  return {
    disconnect() {
      window.clearTimeout(refreshTimer);
      window.clearTimeout(syncTimer);

      revealTimers.forEach((timer) => window.clearTimeout(timer));

      revealTimers.clear();

      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      mutationObserver.disconnect();

      window.removeEventListener('load', refreshPublicAos);
    },
  };
}
