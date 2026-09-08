import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Chatbot from "./Chatbot";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function PageLayout() {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      window.requestAnimationFrame(() => {
        document.querySelector(hash)?.scrollIntoView({ block: "start" });
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
      <Outlet />
      <Footer />
      <Chatbot />
    </>
  );
}
