"use client";

import { useState, useEffect, useCallback } from "react";
import { translations, TranslationKey } from "@/utils/translations";

export type Lang = keyof typeof translations;

function getLangFromCookie(): Lang {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(^| )lang=([^;]+)/);
    if (match?.[2] && match[2] in translations) {
      return match[2] as Lang;
    }
  }
  return "de";
}

export function useTranslation() {
  const [lang, setLang] = useState<Lang>("de");

  // Sprache beim ersten Render laden
  useEffect(() => {
    setLang(getLangFromCookie());
  }, []);

  // Übersetzungsfunktion
  const t = useCallback(
    (key: TranslationKey): string => {
      return (
        translations[lang]?.[key] ||
        translations["de"][key] ||
        key
      );
    },
    [lang]
  );

  // Sprache ändern + Cookie setzen
  const changeLanguage = useCallback((newLang: Lang) => {
    setLang(newLang);
    document.cookie = `lang=${newLang}; path=/; max-age=31536000`;
  }, []);

  return { t, lang, changeLanguage };
}
