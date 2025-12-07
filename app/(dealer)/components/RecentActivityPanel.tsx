"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useTheme } from "@/lib/theme/ThemeContext";
import { FileSpreadsheet, Loader2, ChevronRight, FileText } from "lucide-react";
import { usePathname } from "next/navigation";
import type { FormType } from "@/types/formTypes";

// --------------------------------------------
// TYPES
// --------------------------------------------
type Row = {
  submission_id?: number;
  claim_id?: number;
  project_id?: string | null;
  created_at: string | null;
  status?: string | null;
  typ?: string | null;
};

type Props = {
  dealerId: number;
  limit?: number;
  excelLast?: number;
  formType: FormType;
};

// --------------------------------------------
// Table Mapping
// --------------------------------------------
const tableMap: Record<FormType, string> = {
  bestellung: "submissions",
  verkauf: "submissions",
  projekt: "project_requests",
  support: "support_claims",
  sofortrabatt: "sofortrabatt_claims",
};

// --------------------------------------------
// Prefix for ID Rendering
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
const pdfRoutes: Record<FormType, string> = {
  bestellung: "/api/exports/order-pdf",
  verkauf: "/api/exports/verkauf-pdf",
  projekt: "/api/exports/projekt-pdf",
  support: "/api/exports/support-pdf",
  sofortrabatt: "/api/exports/sofortrabatt-pdf",
};

// --------------------------------------------
// RecentActivityPanel Component
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
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const table = tableMap[formType];
  const isAdminDetail = pathname.includes("/admin/bestellungen/");

  // --------------------------------------------
  // Load Data
  // --------------------------------------------
  async function loadData() {
    setLoading(true);

    let query = supabase
      .from(table as
        | "submissions"
        | "project_requests"
        | "support_claims"
        | "sofortrabatt_claims"
      )
      .select("*")
      .eq("dealer_id", dealerId);

    if (table === "submissions") {
      query = query.eq("typ", formType);
    }

    const { data } = await query.order("created_at", { ascending: false }).limit(20);

    const deduped = dedupeRows(data || []);
    setRows(deduped);
    setLoading(false);
  }


  useEffect(() => {
    loadData();
  }, [dealerId, formType]);

  // --------------------------------------------
  // Realtime
  // --------------------------------------------
  useEffect(() => {
    const channel = supabase
      .channel(`realtime_${table}_${dealerId}_${formType}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `dealer_id=eq.${dealerId}`,
        },
        (payload) => {
          handleRealtime(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealerId, formType]);

  // --------------------------------------------
  // ID helpers
  // --------------------------------------------
  const getRowId = (r: any) =>
    String(
      r?.submission_id ??
        r?.claim_id ??
        r?.project_id ??
        ""
    );

  function dedupeRows(list: any[]): Row[] {
    const seen = new Set<string>();
    const out: Row[] = [];

    for (const r of list) {
      const id = getRowId(r);
      if (!seen.has(id)) {
        seen.add(id);
        out.push(r);
      }
    }
    return out;
  }

  function handleRealtime(payload: any) {
    const row = payload.new ?? payload.old;
    if (!row) return;

    const id = getRowId(row);

    setRows((prev) => {
      const list = [...prev];
      const index = list.findIndex((x) => getRowId(x) === id);

      if (payload.eventType === "INSERT") {
        if (index === -1) list.unshift(row);
      } else if (payload.eventType === "UPDATE") {
        if (index !== -1) list[index] = row;
      } else if (payload.eventType === "DELETE") {
        if (index !== -1) list.splice(index, 1);
      }

      return dedupeRows(list).slice(0, 20);
    });

    if (!isAdminDetail) {
      setHighlightedId(id);
      setTimeout(() => setHighlightedId(null), 3000);
    }
  }

  // Date formatter
  const fmtDate = (iso: string | null) =>
    iso
      ? new Date(iso).toLocaleString("de-CH", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "–";

  // Title mapping
  const titleMap: Record<FormType, string> = {
    bestellung: "Letzte Bestellungen",
    verkauf: "Letzte Verkaufsmeldungen",
    projekt: "Letzte Projekte",
    support: "Letzte Support-Anträge",
    sofortrabatt: "Letzte Sofortrabatt-Anträge",
  };

  // --------------------------------------------
  // Download PDF
  // --------------------------------------------
  async function downloadPdf(id: string) {
    const route = pdfRoutes[formType];
    const res = await fetch(`${route}?id=${id}`);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${formType}_${id}.pdf`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // --------------------------------------------
  // Download Excel
  // --------------------------------------------
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
        <h2 className="font-semibold text-gray-800 text-sm">{titleMap[formType]}</h2>

        <button
          onClick={downloadExcel}
          disabled={downloading}
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 border rounded hover:bg-gray-50 ${theme.color}`}
        >
          {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
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
            const idRaw = getRowId(r);
            const id = `${prefixMap[formType]}-${String(idRaw).padStart(4, "0")}`;

            return (
              <li
                key={idRaw}
                className={`relative rounded-lg border-l-4 ${theme.border} p-2 ${
                  highlightedId === idRaw ? "animate-pulse bg-blue-50 border-blue-300" : ""
                }`}
              >
                <div className="flex items-center justify-between text-[13px]">
                  <div>
                    <span className="font-semibold text-sm">#{id}</span>{" "}
                    <span className="text-gray-500">• {fmtDate(r.created_at)}</span>{" "}
                    {r.status && (
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">{r.status}</span>
                    )}
                  </div>

                  <button
                    onClick={() => downloadPdf(String(idRaw))}
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 border rounded hover:bg-gray-50 ${theme.color}`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    PDF
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
