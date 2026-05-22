"use client";

import { useEffect } from "react";

/**
 * Tracks scroll position over [data-story] chapters and writes the active
 * chapter index onto [data-story-pin] as data-active-story. CSS reacts.
 *
 * Uses the "-50% top / -50% bottom" rootMargin trick: this collapses the
 * IntersectionObserver root to a 1px horizontal line at viewport center,
 * so whichever chapter crosses the center becomes active.
 */
export default function ScrollStories() {
  useEffect(() => {
    const chapters = document.querySelectorAll<HTMLElement>("[data-story]");
    const pin = document.querySelector<HTMLElement>("[data-story-pin]");
    if (!chapters.length || !pin) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const n = entry.target.getAttribute("data-story");
            if (n) pin.setAttribute("data-active-story", n);
          }
        }
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    chapters.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  return null;
}
