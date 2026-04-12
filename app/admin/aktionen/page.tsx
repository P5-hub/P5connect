"use client";

import UnifiedDashboardList from "@/components/admin/UnifiedDashboardList";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function AktionenPage() {
  const { t } = useI18n();

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">
        {t("adminCommon.promotions")}
      </h2>
      <p className="text-sm text-gray-500">
        {t("adminAktionen.description")}
      </p>
      <UnifiedDashboardList type="aktion" />
    </div>
  );
}