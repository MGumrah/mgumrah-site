"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const transitionTimer = useRef<number | null>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme") as Theme | null;
    const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme ?? preferredTheme;

    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;

    if (transitionTimer.current) {
      window.clearTimeout(transitionTimer.current);
    }

    root.classList.add("theme-transitioning");
    root.getBoundingClientRect();

    setTheme(nextTheme);
    root.dataset.theme = nextTheme;
    window.localStorage.setItem("theme", nextTheme);

    transitionTimer.current = window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
      transitionTimer.current = null;
    }, 1600);
  }

  return (
    <button
      className="icon-btn"
      type="button"
      aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
      onClick={toggleTheme}
    >
      {theme === "dark" ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      )}
    </button>
  );
}
