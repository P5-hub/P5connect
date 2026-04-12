"use client";

import UnifiedDashboardList from "@/components/admin/UnifiedDashboardList";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function SofortrabattPage() {
  const { t } = useI18n();

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">
        {t("adminSofortrabatt.page.title")}
      </h2>
      <p className="text-sm text-gray-500">
        {t("adminSofortrabatt.page.description")}
      </p>
      <UnifiedDashboardList type="sofortrabatt" />
    </div>
  );
}