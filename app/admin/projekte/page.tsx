"use client";
import UnifiedDashboardList from "@/components/admin/UnifiedDashboardList";

export default function ProjektePage() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Projekte verwalten</h2>
      <UnifiedDashboardList type="projekt" />
    </div>
  );
}
