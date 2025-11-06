"use client";
import UnifiedDashboardList from "@/components/admin/UnifiedDashboardList";

export default function SupportPage() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Sell-Out Support verwalten</h2>
      <p className="text-sm text-gray-500">
        Übersicht aller eingereichten Sell-Out-Support-Anträge. Filtere nach Status oder finde gezielt Händler.
      </p>
      <UnifiedDashboardList type="support" />
    </div>
  );
}
