"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";

type Dealer = {
  dealer_id?: number | string | null;
  login_nr?: string | null;
  store_name?: string | null;
  company_name?: string | null;
  address?: string | null;
  zip?: string | null;
  city?: string | null;
  email?: string | null;
  phone?: string | null;
};

export default function DealerInfoCompact({ dealer }: { dealer: Dealer }) {
  const { t } = useI18n();

  if (!dealer) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-gray-500 text-sm">
        {t("dealer.notfound")}
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm text-sm space-y-1">
      <p>
        <span className="font-semibold">{t("dealer.company")}:</span>{" "}
        {dealer.company_name || "-"}
      </p>

      <p>
        <span className="font-semibold">{t("dealer.shop")}:</span>{" "}
        {dealer.store_name || "-"}
      </p>

      <p>
        <span className="font-semibold">{t("dealer.city")}:</span>{" "}
        {dealer.zip || ""} {dealer.city || ""}
      </p>

      <p>
        <span className="font-semibold">{t("dealer.email")}:</span>{" "}
        {dealer.email || "-"}
      </p>

      <p>
        <span className="font-semibold">{t("dealer.phone")}:</span>{" "}
        {dealer.phone || "-"}
      </p>
    </div>
  );
}