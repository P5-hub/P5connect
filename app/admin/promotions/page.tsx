"use client";

import UnifiedDashboardList from "@/components/admin/UnifiedDashboardList";

export default function PromotionsPage() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">
        Promotionen verwalten
      </h2>
      <p className="text-sm text-gray-500">
        Übersicht aller aktiven oder vergangenen Promotionen. 
        Filtere nach Status oder suche nach spezifischen Aktionen.
      </p>
      <UnifiedDashboardList type="aktion" />
    </div>
  );
}
