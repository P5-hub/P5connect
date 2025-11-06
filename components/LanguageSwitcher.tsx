"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

const languages = [
  { code: "de", label: "Deutsch" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "rm", label: "Rumantsch" }, // Rätoromanisch
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string>("de");

  // Beim ersten Render Cookie auslesen
  useEffect(() => {
    const match = document.cookie.match(/(^| )lang=([^;]+)/);
    if (match?.[2]) {
      setSelected(match[2]);
    }
  }, []);

  const handleChange = (lang: string) => {
    setSelected(lang);

    // Cookie setzen (1 Jahr gültig)
    document.cookie = `lang=${lang}; path=/; max-age=31536000`;

    // Refresh, damit RootLayout neu gerendert wird
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="flex gap-2">
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => handleChange(l.code)}
          disabled={isPending}
          className={`rounded-md border px-3 py-1 text-sm transition ${
            selected === l.code
              ? "bg-indigo-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
