"use client";

import { ShoppingCart } from "lucide-react";
import BestellungForm from "@/app/(dealer)/components/forms/BestellungForm";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { useDealer } from "@/app/(dealer)/DealerContext";

export default function BestellungClient() {
  const { t } = useI18n();
  const dealer = useDealer(); // Händler kommt sauber aus dem Context!

  // -------------------------------------
  // Ladezustände
  // -------------------------------------
  if (dealer === undefined) {
    // sollte niemals passieren – nur Fallback
    return <p className="text-gray-500">⏳ Initialisiere…</p>;
  }

  if (!dealer) {
    return (
      <p className="text-red-500 p-4">
        Händler konnte nicht geladen werden.
      </p>
    );
  }

  // -------------------------------------
  // Render
  // -------------------------------------

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-600">
        <ShoppingCart className="w-7 h-7" />
        {t("bestprice.heading")}
      </h1>

      {/* Das Formular bezieht Dealer selbst via useDealer() */}
      <BestellungForm />
    </div>
  );
}
