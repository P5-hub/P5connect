"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useTheme } from "@/lib/theme/ThemeContext";
import { FileSpreadsheet, Loader2, FileText } from "lucide-react";
import { usePathname } from "next/navigation";
import type { FormType } from "@/types/formTypes";

// --------------------------------------------
// TYPES
// --------------------------------------------
type Row = {
  submission_id: string;
  dealer_id: number;
  typ: FormType;
  status: string | null;
  created_at: string;
};

type Props = {
  dealerId: number;
  limit?: number;
  excelLast?: number;
  formType: FormType;
};

// --------------------------------------------
// Prefix Map
// --------------------------------------------
const prefixMap: Record<FormType, string> = {
  bestellung: "B",
  verkauf: "V",
  projekt: "P",
  support: "S",
  sofortrabatt: "R",
};

// --------------------------------------------
// PDF Routes
// --------------------------------------------
const pdfRoutes: Partial<Record<FormType, string>> = {
  bestellung: "/api/exports/order-pdf",
  verkauf: "/api/exports/verkauf-pdf",
  projekt: "/api/exports/projekt-pdf",
  support: "/api/exports/support-pdf",
  sofortrabatt: "/api/exports/sofortrabatt-pdf",
};

// --------------------------------------------
// Component
// --------------------------------------------
export default function RecentActivityPanel({
  dealerId,
  limit = 2,
  excelLast = 100,
  formType,
}: Props) {
  const supabase = getSupabaseBrowser();
  const theme = useTheme();
  const pathname = usePathname();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const isAdminDetail = pathname.includes("/admin/bestellungen/");

  // --------------------------------------------
  // Load Data (View = Single Source of Truth)
  // --------------------------------------------
  async function loadData() {
    setLoading(true);

    const { data, error } = await supabase
      .from("v_submission_history_header" as any)
      .select("submission_id, dealer_id, typ, status, created_at")
      .eq("dealer_id", dealerId)
      .eq("typ", formType)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("❌ Verlauf Fehler:", error);
      setRows([]);
    } else {
      setRows((data as unknown as Row[]) ?? []);
    }

    setLoading(false);
  }

  // --------------------------------------------
  // Realtime Handling (DER ENTSCHEIDENDE TEIL)
  // --------------------------------------------
  function handleRealtime(payload: any) {
    console.log("🔥 REALTIME EVENT", payload);
    const row = payload.new ?? payload.old;
    if (!row?.submission_id) return;

    const id = String(row.submission_id);

    // 1️⃣ sofort Highlight (Händler)
    if (!isAdminDetail) {
      setHighlightedId(id);
      setTimeout(() => setHighlightedId(null), 3000);
    }

    // 2️⃣ lokalen State sofort aktualisieren (erzwingt Re-Render!)
    setRows((prev) => {
      const next = [...prev];
      const index = next.findIndex((r) => r.submission_id === id);

      if (index !== -1) {
        next[index] = {
          ...next[index],
          status: row.status ?? next[index].status,
        };
      }

      return next;
    });

    // 3️⃣ View leicht verzögert nachladen
    setTimeout(loadData, 200);
  }

  // --------------------------------------------
  // Initial Load
  // --------------------------------------------
  useEffect(() => {
    loadData();
  }, [dealerId, formType]);

  // --------------------------------------------
  // Realtime Subscription
  // --------------------------------------------
  useEffect(() => {
    const channel = supabase
      .channel(`realtime_history_${dealerId}_${formType}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "submissions",
          filter: `dealer_id=eq.${dealerId}`,
        },
        handleRealtime
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "verkauf_csv_meldungen",
          filter: `dealer_id=eq.${dealerId}`,
        },
        handleRealtime
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_claims",
          filter: `dealer_id=eq.${dealerId}`,
        },
        handleRealtime
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealerId, formType]);

  // --------------------------------------------
  // Helpers
  // --------------------------------------------
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  function highlightClass(row: Row) {
    if (highlightedId !== row.submission_id) return "";

    if (row.status === "approved") {
      return "animate-pulse bg-green-50 border-green-400";
    }

    if (row.status === "rejected") {
      return "animate-pulse bg-red-50 border-red-400";
    }

    return "animate-pulse bg-blue-50 border-blue-300";
  }

  // --------------------------------------------
  // Downloads
  // --------------------------------------------
  async function downloadPdf(id: string) {
    const route = pdfRoutes[formType];
    if (!route) return;

    const res = await fetch(`${route}?id=${id}`);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${formType}_${id}.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function downloadExcel() {
    setDownloading(true);

    const res = await fetch("/api/exports/orders", {
      method: "POST",
      body: JSON.stringify({ dealerId, last: excelLast, type: formType }),
      headers: { "Content-Type": "application/json" },
    });

    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${formType}_verlauf.xlsx`;
    a.click();
    URL.revokeObjectURL(a.href);

    setDownloading(false);
  }

  const visible = useMemo(() => rows.slice(0, limit), [rows, limit]);

  // --------------------------------------------
  // Render
  // --------------------------------------------
  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm relative">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-sm">
          Letzte {formType === "verkauf" ? "Verkaufsmeldungen" : "Aktivitäten"}
        </h2>

        <button
          onClick={downloadExcel}
          disabled={downloading}
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 border rounded hover:bg-gray-50 ${theme.color}`}
        >
          {downloading ? (
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
        <p className="text-sm text-gray-500">Keine Daten gefunden.</p>
      ) : (
        <ul className="space-y-1.5">
          {visible.map((r) => {
            const id = `${prefixMap[r.typ]}-${r.submission_id}`;

            return (
              <li
                key={r.submission_id}
                className={`relative rounded-lg border-l-4 ${theme.border} p-2 ${highlightClass(r)}`}
              >
                <div className="flex items-center justify-between text-[13px]">
                  <div>
                    <span className="font-semibold text-sm">#{id}</span>{" "}
                    <span className="text-gray-500">• {fmtDate(r.created_at)}</span>{" "}
                    {r.status && (
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">
                        {r.status}
                      </span>
                    )}
                  </div>

                  {r.status !== "csv" && pdfRoutes[r.typ] && (
                    <button
                      onClick={() => downloadPdf(r.submission_id)}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 border rounded hover:bg-gray-50 ${theme.color}`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
