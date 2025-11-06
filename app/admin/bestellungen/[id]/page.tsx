"use client";

import UniversalDetailPage from "@/lib/templates/UniversalDetailPage";

export default function BestellungDetailPage() {
  return (
    <UniversalDetailPage
      tableName="submissions"
      typeFilter="bestellung"
      title="Bestellung"
    />
  );
}
