import { Suspense } from "react";
import AktionenContent from "./components/AktionenContent";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function AktionenPage() {
  return (
    <Suspense fallback={<div className="p-6">Lade Aktionen…</div>}>
      <AktionenContent />
    </Suspense>
  );
}
