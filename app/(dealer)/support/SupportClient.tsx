"use client";

import { useDealer } from "@/app/(dealer)/DealerContext";
import SupportForm from "@/app/(dealer)/components/forms/SupportForm";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function SupportClient() {
  const dealer = useDealer();
  const { t } = useI18n();

  if (dealer === undefined) {
    return (
      <p className="text-gray-500">
        {t("dealer.loading")}
      </p>
    );
  }

  if (!dealer) {
    return (
      <p className="text-red-500">
        {t("dealer.notfound")}
      </p>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold flex items-center gap-2 text-orange-600">
        🛟 {t("support.heading")}
      </h1>

      {/* Supportformular bekommt Händler automatisch über useDealer() */}
      <SupportForm />
    </div>
  );
}
