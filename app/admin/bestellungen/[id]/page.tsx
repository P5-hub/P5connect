"use client";

import UniversalDetailPage from "@/lib/templates/UniversalDetailPage";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function BestellungDetailPage() {
  const { t } = useI18n();

  return (
    <UniversalDetailPage
      tableName="submissions"
      typeFilter="bestellung"
      title={t("adminCommon.orders")}
    />
  );
}