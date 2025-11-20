"use client";

import BestellungForm from "@/components/forms/BestellungForm";
import { ShoppingCart } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function BestellungPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6 pb-20">
      {/* 🛒 Titel */}
      <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-600">
        <ShoppingCart className="w-7 h-7" />
        {t("bestprice.heading")}
      </h1>

      {/* Formular */}
      <BestellungForm />
    </div>
  );
}
