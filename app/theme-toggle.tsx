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
      className="theme-toggle"
      type="button"
      aria-label={theme === "dark" ? "Light mode" : "Dark mode"}
      onClick={toggleTheme}
    >
      {theme === "dark" ? "☼" : "☾"}
    </button>
  );
}
