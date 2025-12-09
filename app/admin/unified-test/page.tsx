import { Suspense } from "react";
import UnifiedDashboardTestClient from "./UnifiedDashboardTestClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function UnifiedDashboardTestPage() {
  return (
    <Suspense fallback={<div className="p-6">Lade Dashboard…</div>}>
      <UnifiedDashboardTestClient />
    </Suspense>
  );
}
