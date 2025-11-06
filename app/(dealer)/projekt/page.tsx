"use client";

import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import ProjectForm from "@/components/forms/ProjectForm";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function ProjectPage() {
  const { t, lang } = useI18n();
  const [hydrated, setHydrated] = useState(false);

  // ⏳ SSR → Client Übergang abfangen
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    // Verhindert SSR-Mismatch (zeigt nichts bis Hydration fertig)
    return <div className="h-8 bg-gray-100 rounded animate-pulse w-64" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-purple-700">
        <ClipboardList className="w-5 h-5" />
        <h1 className="text-xl font-semibold">
          {t("project.page.title") || t("project.title")}
        </h1>
      </div>

      <ProjectForm key={lang} />
    </div>
  );
}
