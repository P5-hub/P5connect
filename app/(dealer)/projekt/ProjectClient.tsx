"use client";

import { ClipboardList } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useDealer } from "@/app/(dealer)/DealerContext";
import ProjectForm from "@/app/(dealer)/components/forms/ProjectForm";

export default function ProjectClient() {
  const dealer = useDealer();
  const { t } = useI18n();

  if (dealer === undefined) {
    return <p className="text-gray-500">⏳ Initialisiere…</p>;
  }

  if (!dealer) {
    return (
      <p className="p-4 text-red-600">
        {t("dealer.notfound")}
      </p>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex items-center gap-2 text-purple-700">
        <ClipboardList className="w-5 h-5" />
        <h1 className="text-xl font-semibold">
          {t("project.heading", { defaultValue: "Projektmeldung" })}
        </h1>
      </div>

      <ProjectForm />
    </div>
  );
}
