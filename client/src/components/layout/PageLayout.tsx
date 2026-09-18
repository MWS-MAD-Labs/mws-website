import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Chatbot from "./Chatbot";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function PageLayout() {
  const { hash, pathname } = useLocation();

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
    </>
  );
}
