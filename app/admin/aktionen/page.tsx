"use client";

import UnifiedDashboardList from "@/components/admin/UnifiedDashboardList";

export default function AktionenPage() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Promotionen & Aktionen verwalten</h2>
      <p className="text-sm text-gray-500">
        Übersicht aller aktiven oder abgelaufenen Promotionen. Du kannst den Status ändern oder Aktionen aktivieren/deaktivieren.
      </p>
      <UnifiedDashboardList type="aktion" />
    </div>
  );
}
