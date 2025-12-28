"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useTheme } from "@/lib/theme/ThemeContext";
import { FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";

// --------------------------------------------
// TYPES
// --------------------------------------------
type SofortrabattRow = {
  claim_id: number;
  dealer_id: number;
  status: "pending" | "approved" | "rejected" | null;
  created_at: string;
  rabatt_level?: number | null;
  rabatt_betrag?: number | null;
};

type Props = {
  dealerId: number;
  limit?: number;
};

// --------------------------------------------
// COMPONENT
// --------------------------------------------
export default function SofortrabattActivityPanel({
  dealerId,
  limit = 2,
}: Props) {
  const supabase = getSupabaseBrowser();
  const theme = useTheme();
  const pathname = usePathname();

  const [rows, setRows] = useState<SofortrabattRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [downloadingExcel, setDownloadingExcel] = useState(false);

  const isAdminDetail = pathname.includes("/admin");

  // --------------------------------------------
  // LOAD DATA
  // --------------------------------------------
  async function loadData() {
    setLoading(true);

    const { data, error } = await supabase
      .from("sofortrabatt_claims")
      .select(
        "claim_id, dealer_id, status, created_at, rabatt_level, rabatt_betrag"
      )
      .eq("dealer_id", dealerId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("❌ Sofortrabatt Verlauf Fehler:", error);
      setRows([]);
    } else {
      setRows((data as SofortrabattRow[]) ?? []);
    }

    setLoading(false);
  }

  // --------------------------------------------
  // REALTIME HANDLING
  // --------------------------------------------
  function handleRealtime(payload: any) {
    const row = payload.new ?? payload.old;
    if (!row?.claim_id) return;

    const id = Number(row.claim_id);

    if (!isAdminDetail) {
      setHighlightedId(id);
      setTimeout(() => setHighlightedId(null), 3000);
    }

    setRows((prev) => {
      const next = [...prev];
      const index = next.findIndex((r) => r.claim_id === id);

      if (index !== -1) {
        next[index] = {
          ...next[index],
          status: row.status ?? next[index].status,
        };
      } else {
        next.unshift(row);
      }

      return next;
    });

    setTimeout(loadData, 200);
  }

  // --------------------------------------------
  // INITIAL LOAD
  // --------------------------------------------
  useEffect(() => {
    loadData();
  }, [dealerId]);

  // --------------------------------------------
  // REALTIME SUBSCRIPTION
  // --------------------------------------------
  useEffect(() => {
    const channel = supabase
      .channel(`realtime_sofortrabatt_${dealerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sofortrabatt_claims",
          filter: `dealer_id=eq.${dealerId}`,
        },
        handleRealtime
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealerId]);

  // --------------------------------------------
  // HELPERS
  // --------------------------------------------
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  function highlightClass(row: SofortrabattRow) {
    if (highlightedId !== row.claim_id) return "";

    if (row.status === "approved") {
      return "animate-pulse bg-green-50 border-green-400";
    }

    if (row.status === "rejected") {
      return "animate-pulse bg-red-50 border-red-400";
    }

    return "animate-pulse bg-blue-50 border-blue-300";
  }

  const visible = useMemo(() => rows.slice(0, limit), [rows, limit]);

  // --------------------------------------------
  // DOWNLOADS
  // --------------------------------------------
  async function downloadExcel() {
    setDownloadingExcel(true);

    try {
      const res = await fetch("/api/exports/sofortrabatt_excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealerId, last: 100 }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Export failed (${res.status}): ${text}`);
      }

      const contentType = res.headers.get("content-type") || "";
      if (
        !contentType.includes(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
      ) {
        const text = await res.text();
        throw new Error(`Invalid content-type: ${contentType}\n${text}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "sofortrabatte.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("❌ Sofortrabatt Excel Fehler:", e);
      alert("Excel-Export fehlgeschlagen. Details siehe Konsole.");
    } finally {
      setDownloadingExcel(false);
    }
  }

  async function downloadPdf(id: number) {
    try {
      const res = await fetch(`/api/exports/sofortrabatt-pdf?id=${id}`);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`PDF Export failed (${res.status}): ${text}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `sofortrabatt_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("❌ Sofortrabatt PDF Fehler:", e);
      alert("PDF-Export fehlgeschlagen. Details siehe Konsole.");
    }
  }

  // --------------------------------------------
  // RENDER
  // --------------------------------------------
  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm relative">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-sm">
          Letzte Sofortrabatte
        </h2>

        <button
          onClick={downloadExcel}
          disabled={downloadingExcel}
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 border rounded hover:bg-gray-50 ${theme.color}`}
        >
          {downloadingExcel ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-3.5 h-3.5" />
          )}
          Excel
        </button>
      </div>

      {loading ? (
        <div className="py-4 text-sm text-gray-500 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> lädt …
        </div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-gray-500">Keine Sofortrabatte gefunden.</p>
      ) : (
        <ul className="space-y-1.5">
          {visible.map((r) => (
            <li
              key={r.claim_id}
              className={`relative rounded-lg border-l-4 ${theme.border} p-2 ${highlightClass(
                r
              )}`}
            >
              <div className="flex items-center justify-between text-[13px]">
                <div>
                  <span className="font-semibold text-sm">
                    #R-{String(r.claim_id).padStart(4, "0")}
                  </span>{" "}
                  <span className="text-gray-500">
                    • {fmtDate(r.created_at)}
                  </span>{" "}
                  {r.status && (
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">
                      {r.status}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => downloadPdf(r.claim_id)}
                  className={`inline-flex items-center gap-1 text-xs px-2 py-1 border rounded hover:bg-gray-50 ${theme.color}`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>

              {(r.rabatt_level || r.rabatt_betrag) && (
                <div className="mt-1 text-xs text-gray-600">
                  {r.rabatt_level && <>Level {r.rabatt_level}</>}
                  {r.rabatt_level && r.rabatt_betrag && " – "}
                  {r.rabatt_betrag && (
                    <>{Number(r.rabatt_betrag).toFixed(2)} CHF</>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
