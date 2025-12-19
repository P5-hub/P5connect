"use client";

import VerkaufForm from "@/app/(dealer)/components/forms/VerkaufForm";
import { BarChart3 } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useActiveDealer } from "@/app/(dealer)/hooks/useActiveDealer";

export default function VerkaufClient() {
  const { t } = useI18n();
  const { dealer, loading } = useActiveDealer();

  if (loading) {
    return <p className="text-gray-500">⏳ Händler wird geladen…</p>;
  }

  if (!dealer) {
    return (
      <p className="text-red-500 p-4">
        Händler konnte nicht geladen werden.
      </p>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold flex items-center gap-2 text-green-600">
        <BarChart3 className="w-7 h-7" />
        {t("sales.heading")}
      </h1>

      <VerkaufForm />
    </div>
  );
}
