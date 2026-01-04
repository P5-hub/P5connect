"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  ChevronRight,
  ShoppingCart,
  BarChart3,
  Briefcase,
  LifeBuoy,
  Percent,
  Loader2,
  FileText,
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { usePathname } from "next/navigation";

/** --- Types --- */
type ProductMini = {
  product_name?: string | null;
  model?: string | null;
  brand?: string | null;
  ean?: string | null;
};
type SubmissionItem = {
  menge: number | null;
  preis: number | null;
  products: ProductMini | null;
  distributors?: { name?: string | null; code?: string | null } | null;
};
type MiniEntry = {
  submission_id: number;
  created_at: string;
  mengeSum: number;
  dealer_reference?: string | null;
  requested_delivery?: "SOFORT" | "TERMIN" | null;
  requested_delivery_date?: string | null;
};

const fmtDateTime = (iso: string) =>
  new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

const fmtMoney = (v: number | null | undefined) =>
  typeof v === "number"
    ? new Intl.NumberFormat("de-CH", {
        style: "currency",
        currency: "CHF",
        maximumFractionDigits: 2,
      }).format(v)
    : "-";

const iconByType: Record<string, any> = {
  verkauf: BarChart3,
  bestellung: ShoppingCart,
  projekt: Briefcase,
  support: LifeBuoy,
  sofortrabatt: Percent,
};

export default function HistoryGlobal({ dealer }: { dealer: any }) {
  const supabase = getSupabaseBrowser();
  const pathname = usePathname();

  const typeByPath: Record<string, string> = {
    "/verkauf": "verkauf",
    "/bestellung": "bestellung",
    "/projekt": "projekt",
    "/support": "support",
    "/sofortrabatt": "sofortrabatt",
  };

  const activeTyp =
    Object.entries(typeByPath).find(([p]) => pathname.startsWith(p))?.[1] ??
    "verkauf";
  const Icon = iconByType[activeTyp] || ShoppingCart;

  const [rows, setRows] = useState<MiniEntry[]>([]);
  const [hoverId, setHoverId] = useState<number | null>(null);
  const [hoverLoading, setHoverLoading] = useState(false);
  const [hoverItems, setHoverItems] = useState<SubmissionItem[] | null>(null);

  /** Kopf-Liste laden (ohne teure Joins) */
  useEffect(() => {
    if (!dealer?.dealer_id) return;

    (async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select(
          `
          submission_id,
          created_at,
          dealer_reference,
          requested_delivery,
          requested_delivery_date,
          submission_items:submission_items(count)
        `
        )
        .eq("dealer_id", dealer.dealer_id)
        // ✅ Endgültige, stabile Lösung
        .eq("typ", activeTyp as any)
        .order("created_at", { ascending: false })
        .limit(10);


      if (error) {
        console.error("history load error:", error);
        setRows([]);
        return;
      }

      const list: MiniEntry[] = (data ?? []).map((r: any) => ({
        submission_id: r.submission_id,
        created_at: r.created_at,
        dealer_reference: r.dealer_reference ?? null,
        requested_delivery: r.requested_delivery ?? null,
        requested_delivery_date: r.requested_delivery_date ?? null,
        mengeSum:
          (Array.isArray(r.submission_items) &&
            r.submission_items[0]?.count) ||
          0,
      }));

      setRows(list.slice(0, 3));
    })();
  }, [dealer?.dealer_id, activeTyp, supabase]);

  /** Details für Hover */
  const fetchDetails = async (id: number) => {
    setHoverLoading(true);
    setHoverItems(null);
    try {
      const { data, error } = await supabase
        .from("submission_items")
        .select(
          `
          menge,
          preis,
          products ( product_name, model, brand, ean ),
          distributors ( name, code )
        `
        )
        .eq("submission_id", id);

      if (error) throw error;
      setHoverItems((data as any) ?? []);
    } catch (e) {
      console.error("hover details error:", e);
      setHoverItems([]);
    } finally {
      setHoverLoading(false);
    }
  };

  const onEnter = (id: number) => {
    setHoverId(id);
    fetchDetails(id);
  };
  const onLeave = () => {
    setHoverId(null);
    setHoverItems(null);
    setHoverLoading(false);
  };

  /** Excel: POST /api/exports/orders  */
  const downloadExcel = async () => {
    if (!dealer?.dealer_id) return;
    try {
      const res = await fetch("/api/exports/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealerId: dealer.dealer_id, last: 100 }),
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `bestellverlauf_${dealer.dealer_id}.xlsx`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e: any) {
      console.error("excel export error:", e?.message ?? e);
      window.alert("Excel-Export fehlgeschlagen");
    }
  };

  /** PDF: GET /api/exports/order-pdf?id=<submission_id> */
  const downloadPDF = async (submission_id: number) => {
    try {
      const res = await fetch(`/api/exports/order-pdf?id=${submission_id}`);
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `bestellung_${submission_id}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e: any) {
      console.error("pdf export error:", e?.message ?? e);
      window.alert("PDF-Export fehlgeschlagen");
    }
  };

  const headerTitle = useMemo(() => {
    switch (activeTyp) {
      case "bestellung":
        return "Letzte Aktivitäten";
      case "verkauf":
        return "Letzte Verkäufe";
      case "projekt":
        return "Letzte Projekte";
      case "support":
        return "Letzte Supportfälle";
      default:
        return "Letzte Aktivitäten";
    }
  }, [activeTyp]);

  return (
    <div className="rounded-lg border bg-white shadow p-4 w-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-600" />
          {headerTitle}
        </h2>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={downloadExcel}
            title="Verlauf als Excel herunterladen"
            className="inline-flex items-center gap-1 text-sm px-2 py-1 border rounded hover:bg-gray-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>

          <Link
            href={`/verlauf${activeTyp ? `?typ=${activeTyp}` : ""}`}
            className="text-sm text-blue-600 hover:underline"
          >
            Gesamten Verlauf →
          </Link>
        </div>

      </div>

      {rows.length === 0 ? (
        <p className="text-gray-500 text-sm">Keine Einträge gefunden.</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li
              key={r.submission_id}
              onMouseEnter={() => onEnter(r.submission_id)}
              onMouseLeave={onLeave}
              onFocus={() => onEnter(r.submission_id)}
              onBlur={onLeave}
              className="group border rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
            >
              {/* Kopfzeile */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon className="w-4 h-4 text-gray-600" />
                  <span className="font-medium truncate">
                    #{r.submission_id} — {fmtDateTime(r.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm text-gray-600">{r.mengeSum} Pos.</span>

                  <button
                    onClick={() => downloadPDF(r.submission_id)}
                    title="PDF herunterladen"
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <FileText className="w-4 h-4 text-gray-700" />
                  </button>

                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                </div>
              </div>

              {/* Meta (klein) */}
              <div className="mt-1 text-[12px] text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                {r.dealer_reference && <span>Ref.: {r.dealer_reference}</span>}
                {r.requested_delivery && (
                  <span>
                    Lieferung: {r.requested_delivery}
                    {r.requested_delivery === "TERMIN" && r.requested_delivery_date
                      ? ` (${r.requested_delivery_date})`
                      : ""}
                  </span>
                )}
              </div>

              {/* Hover-Details */}
              <div className="mt-2">
                {hoverId === r.submission_id ? (
                  hoverLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Lade Details…
                    </div>
                  ) : hoverItems && hoverItems.length > 0 ? (
                    <div className="text-sm text-gray-700">
                      {hoverItems.slice(0, 3).map((it, idx) => {
                        const p = it.products ?? {};
                        const title =
                          p.product_name || p.model || p.ean || "Produkt";
                        const disti =
                          it.distributors?.name || it.distributors?.code || "";
                        return (
                          <div
                            key={`${r.submission_id}-it-${idx}`}
                            className="flex items-center justify-between py-0.5"
                          >
                            <div className="truncate">
                              <span className="font-medium">{title}</span>
                              {disti ? (
                                <span className="text-gray-400"> — {disti}</span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-gray-500">
                                {it.menge ?? 0}×
                              </span>
                              <span className="font-medium">
                                {fmtMoney(it.preis)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {hoverItems.length > 3 && (
                        <div className="text-[12px] text-gray-500 mt-1">
                          … und {hoverItems.length - 3} weitere
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Keine Details gefunden.
                    </div>
                  )
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
