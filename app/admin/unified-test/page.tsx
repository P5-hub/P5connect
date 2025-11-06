"use client";

import UnifiedDashboard from "@/components/admin/UnifiedDashboard";

export default function UnifiedDashboardTestPage() {
  return (
    <div className="p-6">
      <UnifiedDashboard submissionType="bestellung" />
    </div>
  );
}
