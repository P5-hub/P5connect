"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 🌐 Language Switcher Dropdown
 * - unterstützt de / en / fr / it / rm
 * - speichert Auswahl im Cookie & localStorage
 * - hydrationssicher
 */
export default function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);

  // Hydration-safe: erst rendern, wenn Client da
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const languages = [
    { code: "de", label: "Deutsch", flag: "🇩🇪" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "it", label: "Italiano", flag: "🇮🇹" },
    { code: "rm", label: "Rumantsch", flag: "🇷🇲" },
  ];

  return (
    <div className="relative inline-block text-left">
      {/* 🌐 Hauptbutton */}
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100"
        onClick={() => setOpen((prev) => !prev)}
        title="Sprache wechseln"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{languages.find((l) => l.code === lang)?.flag}</span>
      </Button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          onMouseLeave={() => setOpen(false)}
        >
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code as any);
                setOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 ${
                l.code === lang ? "font-semibold text-purple-700 bg-purple-50" : "text-gray-700"
              }`}
            >
              <span>{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
