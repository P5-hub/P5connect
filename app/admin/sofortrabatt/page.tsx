"use client";

import UnifiedDashboardList from "@/components/admin/UnifiedDashboardList";

export default function SofortrabattPage() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Sofortrabatt Claims verwalten</h2>
      <p className="text-sm text-gray-500">
        Übersicht aller eingereichten Sofortrabatt-Ansprüche aus laufenden Promotionen. Hier kannst du die Anträge prüfen und den Status anpassen.
      </p>
      <UnifiedDashboardList type="sofortrabatt" />
    </div>
  );
}
