"use client";

import UniversalDetailPage from "@/lib/templates/UniversalDetailPage";

export default function SofortrabattDetailPage() {
  return (
    <UniversalDetailPage
      tableName="sofortrabatt_claims"
      title="Sofortrabatt-Antrag"
      storageBucket="sofortrabatt-invoices"
    />
  );
}
