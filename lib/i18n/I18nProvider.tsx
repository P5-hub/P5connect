  "use client";

  import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
  import { translationsByLang, type Lang, type TranslationKey } from "@/lib/i18n/translations";


  type Ctx = {
    lang: Lang;
    setLang: (l: Lang) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
  };

  const I18nContext = createContext<Ctx | null>(null);

  const SUPPORTED: Lang[] = ["de", "en", "fr", "it", "rm"];
  const DEFAULT_LANG: Lang = "de";

  /** ✅ Verbesserte Key-Auflösung (unterstützt Punkt-Keys & Fallbacks) */
  function resolve(obj: any, path: string) {
    if (!obj || typeof obj !== "object") return undefined;

    // 🔹 1. Direkter Treffer (z. B. "project.page.title" als Key im Objekt)
    if (path in obj) return obj[path];

    // 🔹 2. Geschachtelte Suche (z. B. "project.type.hotel")
    const parts = path.split(".");
    let current = obj;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (current && typeof current === "object") {
        // Prüfe, ob Teilkombination als Key existiert (z. B. "type.hotel")
        const combined = parts.slice(i).join(".");
        if (combined in current) return current[combined];

        if (part in current) {
          current = current[part];
        } else {
          return undefined;
        }
      }
    }
    return current;
  }

  /** 🔡 Platzhalter wie {name} oder {count} ersetzen */
  function interpolate(str: string, params?: Record<string, string | number>) {
    if (!params) return str;
    return Object.keys(params).reduce(
      (s, k) => s.replace(new RegExp(`{${k}}`, "g"), String(params[k])),
      str
    );
  }

  /** 🌍 Browser-Sprache erkennen */
  function detectBrowserLang(): Lang {
    if (typeof navigator === "undefined") return DEFAULT_LANG;
    const code = (navigator.language || "de").slice(0, 2).toLowerCase();
    return SUPPORTED.includes(code as Lang) ? (code as Lang) : DEFAULT_LANG;
  }

  /** 🍪 Cookie lesen */
  function getCookie(name: string) {
    if (typeof document === "undefined") return undefined;
    const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return m ? decodeURIComponent(m[2]) : undefined;
  }

  /** 🍪 Cookie setzen */
  function setCookie(name: string, value: string, days = 180) {
    if (typeof document === "undefined") return;
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; expires=${d.toUTCString()}; path=/; SameSite=Lax`;
  }

  /** 🌐 Globaler I18n Provider */
  export default function I18nProvider({
    children,
    initialLang,
  }: {
    children: React.ReactNode;
    initialLang?: Lang;
  }) {
    const [lang, setLang] = useState<Lang>(initialLang || DEFAULT_LANG);

    // ✅ Sprache nach Hydration aus Cookie / LocalStorage übernehmen
    useEffect(() => {
      const saved =
        (typeof window !== "undefined" && (localStorage.getItem("lang") as Lang)) ||
        (getCookie("lang") as Lang) ||
        detectBrowserLang();
      if (saved && SUPPORTED.includes(saved) && saved !== lang) {
        setLang(saved);
      }
    }, []);

    // ✅ Cookie + LocalStorage synchron halten
    useEffect(() => {
      setCookie("lang", lang);
      try {
        localStorage.setItem("lang", lang);
      } catch {
        /* ignore */
      }
    }, [lang]);

    /** Übersetzungsfunktion */
    const t = useMemo(() => {
      return (key: string, params?: Record<string, string | number>) => {
        const fromLang = resolve(translationsByLang[lang], key);
        if (typeof fromLang === "string") return interpolate(fromLang, params);

        const fromEn = resolve(translationsByLang.en, key);
        if (typeof fromEn === "string") return interpolate(fromEn, params);

        return key; // Fallback
      };
    }, [lang]);

    const value: Ctx = { lang, setLang, t };
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
  }

  /** 🪄 Hook zum Zugriff auf Übersetzungen */
  export function useI18n() {
    const ctx = useContext(I18nContext);
    if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
    return ctx;
  }
