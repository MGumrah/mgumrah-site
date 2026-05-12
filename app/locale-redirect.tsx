"use client";

import { useEffect } from "react";

export default function LocaleRedirect() {
  useEffect(() => {
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
    const prefersTurkish = languages.some((language) => language.toLowerCase().startsWith("tr"));

    if (!prefersTurkish) {
      window.location.replace("/en/");
    }
  }, []);

  return null;
}
