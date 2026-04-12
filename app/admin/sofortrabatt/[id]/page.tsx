"use client";

import UniversalDetailPage from "@/lib/templates/UniversalDetailPage";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function SofortrabattDetailPage() {
  const { t } = useI18n();

  return (
    <UniversalDetailPage
      tableName="sofortrabatt_claims"
      title={t("adminSofortrabatt.detail.title")}
      storageBucket="sofortrabatt-invoices"
    />
  );
}