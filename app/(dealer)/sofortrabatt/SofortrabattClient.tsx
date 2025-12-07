"use client";

import SofortrabattForm from "@/app/(dealer)/components/forms/SofortrabattForm";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function SofortrabattClient() {
  const dealer = useDealer();
  const { t } = useI18n();

  if (dealer === undefined) {
    return (
      <div className="p-6 text-gray-500">
        ⏳ {t("dealer.loading")}
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="p-6 text-gray-500">
        🔒 {t("dealer.notfound")}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-pink-600 mb-4">
        {t("instant.page.title")}
      </h1>

      <SofortrabattForm />
    </div>
  );
}
