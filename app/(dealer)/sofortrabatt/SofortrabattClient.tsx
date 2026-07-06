"use client";

import SofortrabattForm from "@/app/(dealer)/components/forms/SofortrabattForm";
import { useDealer } from "@/app/(dealer)/DealerContext";
import { useI18n } from "@/lib/i18n/I18nProvider";

type DealerWithPricingGroup = {
  dealer_id: number;
  dealer_pricing_groups?: {
    sofortrabatt_enabled?: boolean | null;
  } | null;
};

export default function SofortrabattClient() {
  const dealer = useDealer() as DealerWithPricingGroup | null | undefined;
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

  const canUseSofortrabatt =
    dealer.dealer_pricing_groups?.sofortrabatt_enabled === true;

  if (!canUseSofortrabatt) {
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-2xl font-bold text-gray-800">
          Kein Zugriff
        </h1>
        <p className="text-gray-600">
          Der Sofortrabatt ist für diese Händler-Preisgruppe nicht freigeschaltet.
        </p>
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