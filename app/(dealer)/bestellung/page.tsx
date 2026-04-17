import { Suspense } from "react";
import BestellungClient from "./components/BestellungClient";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function BestellungPage() {
  return (
    <Suspense fallback={<div className="p-4">Lade Bestellung…</div>}>
      <BestellungClient />
    </Suspense>
  );
}