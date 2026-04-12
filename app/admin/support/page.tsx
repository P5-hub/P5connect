"use client";

import UnifiedDashboardList from "@/components/admin/UnifiedDashboardList";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function SupportPage() {
  const { t, lang } = useI18n();

  const introText =
    lang === "de"
      ? "Übersicht aller eingereichten Support-Anträge. Filtere nach Status oder finde gezielt Händler."
      : lang === "en"
      ? "Overview of all submitted support requests. Filter by status or find dealers directly."
      : lang === "fr"
      ? "Aperçu de toutes les demandes de support soumises. Filtre par statut ou recherche directement un revendeur."
      : lang === "it"
      ? "Panoramica di tutte le richieste di supporto inviate. Filtra per stato o trova direttamente i rivenditori."
      : lang === "rm"
      ? "Survista da tut las dumondas da support inoltradas. Filtra tenor status u tschertga directamain commerziants."
      : "Overview of all submitted support requests. Filter by status or find dealers directly.";

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">
        {t("adminCommon.support")}
      </h2>
      <p className="text-sm text-gray-500">{introText}</p>
      <UnifiedDashboardList type="support" />
    </div>
  );
}