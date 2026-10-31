import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { prefersReducedMotion } from "./publicAos";

let lenis: Lenis | null = null;

function navbarOffset() {
  const height = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--navbar-height"),
  );

  return Number.isFinite(height) ? height : 0;
}


export function startSmoothScroll() {
  if (lenis || prefersReducedMotion()) {
    return () => {};
  }

  const instance = new Lenis({
    autoRaf: true,
    lerp: 0.09,
    // Chatbot panel, mobile menu and modal bodies scroll on their own.
    allowNestedScroll: true,
    stopInertiaOnNavigate: true,
  });
  lenis = instance;

  // Modals lock the page by setting body overflow; pause Lenis while they do.
  const syncScrollLock = () => {
    if (document.body.style.overflow === "hidden") {
      instance.stop();
    } else {
      instance.start();
    }
  };
  const lockObserver = new MutationObserver(syncScrollLock);
  lockObserver.observe(document.body, { attributes: true, attributeFilter: ["style"] });
  syncScrollLock();

  return () => {
    lockObserver.disconnect();
    instance.destroy();
    lenis = null;
  };
}

export function jumpTo(target: Element | null) {
  if (lenis) {
    lenis.scrollTo(target ?? 0, {
      offset: target ? -navbarOffset() : 0,
      immediate: true,
      force: true,
    });
    return;
  }

  const top = target ? target.getBoundingClientRect().top + window.scrollY - navbarOffset() : 0;
  window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
}
