"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { useTheme } from "@/lib/theme/ThemeContext";
import { FileSpreadsheet, Loader2, ChevronRight, FileText } from "lucide-react";
import { usePathname } from "next/navigation"; // ⬅️ Ganz oben bei den Imports ergänzen


type Props = {
  dealerId: number;
  limit?: number;
  excelLast?: number;
  formType?: "bestellung" | "verkauf" | "projekt" | "support" | "sofortrabatt";
};

type Row = {
  submission_id?: number;
  claim_id?: number;
  project_id?: string | null;   // 👈 wichtig!
  support_id?: string | null;   // 👈 auch hier sicherheitshalber
  created_at: string | null;   // 👈 geändert
  typ?: string | null;
  status?: string | null;
  dealer_reference?: string | null;
  requested_delivery?: string | null;
  requested_delivery_date?: string | null;
  sofortrabatt_betrag?: number | null;
};


export default function RecentActivityPanel({
  dealerId,
  limit = 2,
  excelLast = 100,
  formType = "bestellung",
}: Props) {
  const supabase = getSupabaseBrowser();
  const theme = useTheme();

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [highlightType, setHighlightType] = useState<"ok" | "not_ok" | null>(null);

  // Tabellenzuordnung
  const tableMap = {
    bestellung: "submissions",
    verkauf: "submissions",
    projekt: "project_requests",
    support: "support_claims",
    sofortrabatt: "sofortrabatt_claims",
  } as const;

  const table = tableMap[formType];

  // Daten laden
  async function loadData() {
    if (!dealerId) return;
    setLoading(true);

    try {
      let query = supabase.from(table).select("*").eq("dealer_id", dealerId);

      // für submissions: Filter nach Typ
      if (table === "submissions") {
        query = query.eq("typ", formType);
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(20);
      if (error) throw error;

      // Deduplizieren nach ID
      const seen = new Set<string>();
      const getRowId = (r: any) =>
        String(r?.submission_id ?? r?.claim_id ?? r?.support_id ?? r?.project_id ?? r?.id ?? "");
      const unique = (data || []).filter((r) => {
        const id = getRowId(r);
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      });

      setRows(unique);
    } catch (e: any) {
      console.error("❌ loadData error:", e.message || e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [dealerId, formType]);

  // Realtime Updates (keine Duplikate mehr)
  // 🔄 Realtime Updates (stabil, kein Redirect mehr)
  const pathname = usePathname();
  const isAdminDetail = pathname.includes("/admin/bestellungen/");

  useEffect(() => {
    if (!dealerId || !table) return;

    // 👇 Eindeutiger Channel pro Händler und Formular
    const channelName = `${table}-realtime-${dealerId}-${formType}`;
    const getRowId = (r: any) =>
      String(
        r?.submission_id ??
        r?.claim_id ??
        r?.support_id ??
        r?.project_id ??
        r?.id ??
        ""
      );

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `dealer_id=eq.${dealerId}`,
        },
        (payload) => {
          const { eventType, new: newRow, old: oldRow } = payload;
          const rowId = getRowId(newRow || oldRow);
          if (!rowId) return;

          // 🧱 Nur lokale Daten aktualisieren
          setRows((prev) => {
            const next = [...prev];
            const idx = next.findIndex((x) => getRowId(x) === rowId);

            switch (eventType) {
              case "INSERT":
                if (idx === -1) next.unshift(newRow as Row);
                break;
              case "UPDATE":
                if (idx !== -1) next[idx] = { ...next[idx], ...newRow };
                else next.unshift(newRow as Row);
                break;
              case "DELETE":
                if (idx !== -1) next.splice(idx, 1);
                break;
            }

            return next.slice(0, 20);
          });

          // ✨ Nur Händler (nicht Admin) Highlight-Effekt anzeigen
          if (!isAdminDetail) {
            setHighlightedId(rowId);
            setHighlightType("ok");
            setTimeout(() => {
              setHighlightedId(null);
              setHighlightType(null);
            }, 2500);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dealerId, formType, table, supabase, pathname]);


  const visible = useMemo(() => rows.slice(0, limit), [rows, limit]);

  // Datumsformat
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


  // Tooltip je Formular
  const getTooltipText = (f: string) => {
    switch (f) {
      case "bestellung":
        return "Bestellung eingereicht";
      case "verkauf":
        return "Verkaufsmeldung gespeichert";
      case "projekt":
        return "Projektanfrage gesendet";
      case "support":
        return "Supportfall erstellt";
      case "sofortrabatt":
        return "Sofortrabatt-Antrag eingereicht";
      default:
        return "Vorgang gespeichert";
    }
  };

  // Prefix pro Formular
  const prefixMap: Record<string, string> = {
    bestellung: "B",
    verkauf: "V",
    projekt: "P",
    support: "S",
    sofortrabatt: "R",
  };

  // PDF Download pro Formular
  const pdfRoutes: Record<string, string> = {
    bestellung: "/api/exports/order-pdf",
    verkauf: "/api/exports/verkauf-pdf",
    projekt: "/api/exports/projekt-pdf",
    support: "/api/exports/support-pdf",
    sofortrabatt: "/api/exports/sofortrabatt-pdf",
  };

  const downloadPdf = async (id: string | number) => {
    const route = pdfRoutes[formType];
    if (!route) return alert("Kein PDF verfügbar");

    try {
      const res = await fetch(`${route}?id=${id}`);
      if (!res.ok) throw new Error("PDF-Export fehlgeschlagen");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${formType}_${id}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    } catch (e: any) {
      alert(e?.message || "PDF-Download fehlgeschlagen");
    }
  };

  // Excel Download
  const downloadExcel = async () => {
    try {
      setDownloading(true);
      const res = await fetch("/api/exports/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealerId,
          last: excelLast,
          type: formType, // ✅ Formular-Typ mitgeben (bestellung, verkauf, projekt, support, etc.)
        }),
      });

      if (!res.ok) throw new Error("Export fehlgeschlagen");

      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${formType}_verlauf.xlsx`; // ✅ dynamischer Dateiname
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    } catch (e: any) {
      alert(e?.message || "Export fehlgeschlagen");
    } finally {
      setDownloading(false);
    }
  };


  // Statusfarben
  const statusClass = (status: string | null) => {
    switch (status) {
      case "Bestätigt":
      case "OK":
      case "Erledigt":
      case "Gespeichert":
        return "bg-green-100 text-green-700";
      case "Abgelehnt":
      case "Fehler":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Einheitliche ID-Darstellung (immer 4-stellig + Prefix)
  const formatId = (rawId: any, formType: string) => {
    const prefix = prefixMap[formType] || "";
    let num =
      typeof rawId === "string"
        ? Math.abs(
            Array.from(rawId)
              .map((c) => c.charCodeAt(0))
              .reduce((a, b) => (a + b) % 10000, 0)
          )
        : Number(rawId || 0);
    return `${prefix}-${String(num).padStart(4, "0")}`;
  };

  // Render
  return (
    <div className="rounded-lg border bg-white p-3 shadow-sm relative">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-gray-800 text-sm">
            {formType === "projekt"
              ? "Letzte Projekte"
              : formType === "support"
              ? "Letzte Support-Anträge"
              : formType === "sofortrabatt"
              ? "Letzte Sofortrabatt-Anträge"
              : formType === "verkauf"
              ? "Letzte Verkaufsmeldungen"
              : "Letzte Bestellungen"}
          </h2>

          {rows.length > limit && (
            <Link
              href="/verlauf"
              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              Gesamten Verlauf anzeigen →
            </Link>
          )}
        </div>

        <button
          onClick={downloadExcel}
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 border rounded hover:bg-gray-50 ${theme.color}`}
          disabled={downloading}
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
            const rawId =
              r.submission_id ||
              r.claim_id ||
              r.project_id ||
              r.support_id ||
              (r as any).id ||
              r.created_at;

            const id = formatId(rawId, formType);
            const highlightAnimation =
              highlightedId === String(rawId)
                ? "animate-pulse bg-blue-50 border-blue-300"
                : "";

            return (
              <li
                key={`${formType}-${String(rawId)}`}
                onMouseEnter={() => setHoverId(String(rawId))}
                onMouseLeave={() => setHoverId(null)}
                className={`relative rounded-lg border-l-4 ${theme.border} transition-all ${highlightAnimation}`}
              >
                <div className="flex items-center justify-between p-2 text-[13px] leading-tight">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 text-gray-700">
                      <span className="font-semibold text-sm text-gray-800">#{id}</span>
                      <span className="text-gray-500">• {fmtDate(r.created_at)}</span>
                      {r.status && (
                        <span
                          className={`px-1.5 py-0.5 rounded ${statusClass(r.status)}`}
                        >
                          {r.status}
                        </span>
                      )}
                      {hoverId === String(rawId) && (
                        <span className="ml-2 text-xs text-gray-400 italic transition-opacity duration-300">
                          {getTooltipText(formType)} ({id})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadPdf(String(rawId))}
                      className={`inline-flex items-center gap-1 text-xs px-2 py-1 border rounded hover:bg-gray-50 ${theme.color}`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      PDF
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
